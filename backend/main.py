from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import pandas as pd
import io
from grouping import calculate_group_sizes, balance_groups, parse_group_config
from pdf_generator import generate_pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Service is running"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    group_config: str = Form(None)
):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload Excel or CSV.")
    
    try:
        updated_content = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(updated_content))
        else:
            df = pd.read_excel(io.BytesIO(updated_content))
            
        # Normalize columns: Ensure TG and GPA exist
        # Check for case sensitivity
        cols = {c.lower(): c for c in df.columns}
        if 'tg' not in cols or 'gpa' not in cols:
             # Try to find columns containing TG or GPA
             tg_col = next((c for c in df.columns if 'tg' in c.lower()), None)
             gpa_col = next((c for c in df.columns if 'gpa' in c.lower()), None)
             
             if not tg_col or not gpa_col:
                 raise HTTPException(status_code=400, detail="Columns 'TG' and 'GPA' are required.")
             
             df = df.rename(columns={tg_col: 'TG', gpa_col: 'GPA'})
        else:
             df = df.rename(columns={cols['tg']: 'TG', cols['gpa']: 'GPA'})

        df['GPA'] = pd.to_numeric(df['GPA'], errors='coerce')
        df = df.dropna(subset=['TG', 'GPA'])
        
        total_students = len(df)
        if total_students == 0:
            raise HTTPException(status_code=400, detail="No valid student data found.")
            
        if group_config and group_config.strip():
            try:
                group_sizes = parse_group_config(group_config)
                # Validation: check if total capacity matches student count?
                capacity = sum(group_sizes)
                if capacity != total_students:
                     # Allow mismatch? 
                     # If capacity < total, some students left out.
                     # If capacity > total, some groups smaller.
                     # Strict matching might be annoying.
                     # "Dynamic" request -> Maybe we just warn or fill as much as possible?
                     # Let's enforce roughly equal or user knows what they are doing.
                     # For now, let's warn in logging but proceed. 
                     # Actually, if capacity < total_students, we MUST fail or have leftovers.
                     if capacity < total_students:
                         raise ValueError(f"Configuration capacity ({capacity}) is less than total students ({total_students})")
            except ValueError as e:
                 raise HTTPException(status_code=400, detail=str(e))
        else:
            group_sizes = calculate_group_sizes(total_students, preferred_size=4)
            
        groups = balance_groups(df, group_sizes)
        
        # Calculate stats for response
        response_data = []
        for i, grp in enumerate(groups):
            avg = sum(s['GPA'] for s in grp) / len(grp)
            response_data.append({
                "group_number": i + 1,
                "members": grp,
                "average_gpa": avg,
                "size": len(grp)
            })
            
        return {"groups": response_data, "total_students": total_students}
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/download-pdf")
async def download_pdf(data: dict):
    # data expects {"groups": [...]} structure similar to /upload response
    groups_data = data.get("groups", [])
    if not groups_data:
        raise HTTPException(status_code=400, detail="No group data provided")
        
    # Transform back to list of lists for pdf generator if needed, 
    # OR update pdf_generator to handle the dict structure.
    # Our pdf_generator expects list of lists of student dicts.
    
    # Extract members list from groups_data
    groups_list = []
    for g in groups_data:
        groups_list.append(g.get("members", []))
        
    pdf_buffer = generate_pdf(groups_list)
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=groups.pdf"}
    )
