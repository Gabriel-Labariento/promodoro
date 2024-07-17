from datetime import date
from cs50 import SQL
from flask import redirect, request, session, jsonify
from functools import wraps

# Initialize database
db = SQL("sqlite:///promodoro.db")

def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function

def new_project():
    # Get project name, description, and due date
    project_name = request.form.get("project-name")
    
    # Handle no inputs
    if not request.form.get("project-description"):
        project_description = ""

    if not request.form.get("start-date"):
        start_date = date.today()
        start_date = start_date.strftime("%B %d, %Y")

    if not request.form.get("due-date"):
        due_date = date.today()
        due_date = due_date.strftime("%B %d, %Y")

    if not request.form.get("project_status"):
        project_status = "In Progress"
    project_status = request.form.get("project_status")

    if not request.form.get("project_priority"):
        project_priority = "Medium"
    project_priority = request.form.get("project_priority")


    # Get inputs if there are any
    project_description = request.form.get("project-description")
    due_date = request.form.get("due-date")
    start_date = request.form.get("start-date")

    if not request.form.get("form_id"):
        # Add the projects to the database
        db.execute(
            "INSERT INTO projects (user_id, name, description, start_date, due_date, status, priority) VALUES(?, ?, ?, ?, ?, ?, ?)",
            session["user_id"], project_name, project_description, start_date, due_date, project_status, project_priority
            )
        
    else:
        project_id = request.form.get("edit_project_id")
        # Update the project data in the database
        db.execute(
            "UPDATE projects SET name = ?, description = ?, start_date = ?, due_date = ?, status = ?, priority = ? WHERE user_id = ? AND id = ?",
            project_name, project_description, start_date, due_date, project_status, project_priority, session["user_id"], project_id
            )
    
    return redirect("/projects")


    # Get task name, duration, and parent project if available
    task_id = request.form.get("edit_task_id")
    task_name = request.form.get("edit_task_name")
        
    # Handle no inputs
    if not request.form.get("edit_task_duration"):
        task_duration = 0

    # Get data from database

    projects = db.execute(
        "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
        )

    # Get inputs if there are any
    task_duration = request.form.get("edit_task_duration")
    task_status = request.form.get("edit_task_status")
    task_priority = request.form.get("edit_task_priority")
    parent_project = request.form.get("edit_parent_project")
    user_id = session["user_id"]
    
    # Add the task to the database
    db.execute(
        "UPDATE tasks (name, duration, status, priority project_id) VALUES(?, ?, ?, ?, ?, ?) WHERE user_id = ? AND id = ?",
        task_name, task_duration, task_status, task_priority, parent_project, user_id, task_id
        )
    
    response = {
        'user_id' : user_id,
        'task_name' : task_name,
        'task_duration' : task_duration,
        'parent_project' : parent_project,
        'task_status' : task_status,
        'task_priority' : task_priority,
        'status' : 'success',
        'message' : 'task edited successfully'
    }
    
    return jsonify(response)