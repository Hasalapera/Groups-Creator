import pandas as pd

import pandas as pd
import math

def calculate_group_sizes(total_students: int, preferred_size: int = 4):
    """
    Calculates the number of groups of preferred_size and (preferred_size - 1).
    Returns a list of integer group sizes.
    """
    if total_students < preferred_size: # Handle edge case where total is less than preferred
         # Logic for small batches
         if total_students % 3 == 0:
             return [3] * (total_students // 3)
         if total_students < 3:
             raise ValueError("Not enough students to form a group")
    
    # We want groups of size P and P-1
    # N = x*P + y*(P-1)
    # Start with max P groups
    num_p = total_students // preferred_size
    remainder = total_students % preferred_size
    
    # Each remainder needs to be absorbed by converting a P-group to a (P-1)-group? 
    # No, remainder is "extra" students beyond P*num_p.
    # We formed num_p groups of P. Leftover is `remainder`.
    # This logic is N = num_p * 4 + remainder.
    # We want N = A * 4 + B * 3.
    # Starting from max 4-groups (num_p).
    # If remainder == 0: all 4. 
    # If remainder != 0, we need to reduce num_p to increase "remainder" until it is divisible by 3? 
    # No, we fill "remainder" slots into groups? No.
    
    # Correct Math:
    # 4*A + 3*B = N
    # Maximize A.
    
    a = total_students // 4
    rem = total_students % 4
    
    while rem % 3 != 0:
        a -= 1
        rem += 4
        if a < 0:
            raise ValueError("Cannot distribute students into groups of 4 and 3")
            
    b = rem // 3
    return [4] * a + [3] * b

def parse_group_config(config_str: str) -> list:
    """
    Parses a string like "16x4, 3x3" into a list of group sizes.
    Returns a list of integers e.g., [4, 4, ..., 3, 3]
    """
    sizes = []
    try:
        parts = config_str.split(',')
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            if 'x' in part:
                count, size = map(int, part.lower().split('x'))
                sizes.extend([size] * count)
            else:
                # Assume single group size "4" means one group of 4? 
                # Or just number of groups?
                # User example was "16 4 member groups" -> "16x4"
                # Let's support "16x4" format strictly or simple numbers
                raise ValueError(f"Invalid format: {part}. Use CountxSize (e.g., 16x4)")
                
    except Exception as e:
        raise ValueError(f"Failed to parse config: {str(e)}")
        
    return sizes

def balance_groups(df: pd.DataFrame, group_sizes: list):
    """
    Distributes students into groups based on GPA using a Ratio-based Greedy approach.
    Goal: Minimize the variance of Group Average GPAs.
    Method: Sort students High to Low. Assign next student to the group 
            with the lowest current (Sum GPA / Target Size).
    """
    # Sort by GPA descending
    df_sorted = df.sort_values(by='GPA', ascending=False).reset_index(drop=True)
    records = df_sorted.to_dict('records')
    
    # Initialize groups
    # Structure: { 'members': [], 'current_gpa_sum': 0.0, 'target_size': N, 'id': i }
    groups_state = []
    for i, size in enumerate(group_sizes):
        groups_state.append({
            'id': i,
            'members': [],
            'current_gpa_sum': 0.0,
            'target_size': size
        })
        
    for student in records:
        gpa = student.get('GPA', 0)
        
        # Find valid groups (not full)
        valid_groups = [g for g in groups_state if len(g['members']) < g['target_size']]
        
        if not valid_groups:
            # Should not happen if math is correct
            break
            
        # Select group with lowest current (Sum / Target_Size)
        # This effectively balances the final Projected Average.
        best_group = min(valid_groups, key=lambda g: g['current_gpa_sum'] / g['target_size'])
        
        # Assign
        best_group['members'].append(student)
        best_group['current_gpa_sum'] += gpa
        
    # Return list of list of students
    # Sort groups by ID to maintain original order preference (4s then 3s)
    groups_state.sort(key=lambda g: g['id'])
    
    return [g['members'] for g in groups_state]
