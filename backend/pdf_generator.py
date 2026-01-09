from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

def generate_pdf(groups: list):
    """
    Generates a PDF buffer from the groups list.
    groups: List of lists of student dicts.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    elements.append(Paragraph("Student Group Project Allocations", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Prepare data for table
    # Columns: Group #, TG Number, GPA
    data = [["Group #", "TG Number", "GPA"]]
    
    for i, group in enumerate(groups):
        group_num = i + 1
        # Sort group members by TG number for display or keeps them sorted by GPA?
        # Usually internal group sorting doesn't matter, but let's keep GPA order or Sort by TG?
        # User didn't specify, but TG sort might be easier to find.
        # Let's show as is (balanced mix).
        
        # Calculate Group Average
        gpas = [student.get('GPA', 0) for student in group]
        avg_gpa = sum(gpas) / len(gpas) if gpas else 0
        
        # Add a header row for the group? Or just list students?
        # Option 1: One big table.
        # Option 2: Group blocks.
        # Let's do one big table with Group # merged or repeated.
        
        for student in group:
            data.append([
                f"Group {group_num}",
                str(student.get('TG', 'N/A')),
                f"{student.get('GPA', 0):.2f}"
            ])
            
        # Add summary row for group
        data.append([f"Avg GPA: {avg_gpa:.2f}", "", ""])
        # Add empty row as separator?
        # data.append(["", "", ""])
    
    # Create Table
    # We apply style to merge Avg GPA cells?
    
    t = Table(data, colWidths=[100, 200, 100])
    
    # Style
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]
    
    # Highlighting Group Rows (alternating colors for groups could be nice, but table is flat)
    # Highlight Average rows
    for row_idx, row in enumerate(data):
        if "Avg GPA" in row[0]:
            style_cmds.append(('BACKGROUND', (0, row_idx), (-1, row_idx), colors.lightgrey))
            style_cmds.append(('FONTNAME', (0, row_idx), (-1, row_idx), 'Helvetica-BoldOblique'))
            
    t.setStyle(TableStyle(style_cmds))
    
    elements.append(t)
    doc.build(elements)
    
    buffer.seek(0)
    return buffer
