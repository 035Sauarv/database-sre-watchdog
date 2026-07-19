from fastapi import HTTPException, Header

def verify_role(x_user_role: str = Header(default="Viewer"), required_role: str = "Operator"):
    """
    Security Guard Layer: Evaluates incoming request headers against systemic RBAC policies.
    """
    # Admin bypasses all security constraints
    if x_user_role == "Admin":
        return x_user_role
    
    # Block Viewers from executing Operator-level actions
    if required_role == "Operator" and x_user_role == "Viewer":
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: Insufficient Role Permissions. Operator clearance required."
        )
    
    # Block non-Admins from executing destructive Admin-level actions
    if required_role == "Admin" and x_user_role != "Admin":
        raise HTTPException(
            status_code=403, 
            detail="Access Denied: Administrative Clearance Required."
        )
        
    return x_user_role