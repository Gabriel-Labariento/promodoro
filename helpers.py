import csv
import datetime
import pytz
import urllib
import uuid

from datetime import date
from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
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

def new_task():
    # Get task name, duration, and parent project if available
    task_name = request.form.get("task-name")
        
    # Handle no inputs
    if not request.form.get("task-duration"):
        task_duration = 0

    # Get inputs if there are any
    task_duration = request.form.get("task-duration")
    parent_project = request.form.get("add-parent") # Gives the id of a project

    # Ensure user is logged in
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({'status': 'error', 'message': 'user not logged in'})
    
    # Insert data into the database
    db.execute(
        "INSERT INTO tasks (user_id, name, duration, project_id) VALUES(?, ?, ?, ?)",
        user_id, task_name, task_duration, parent_project
        )
    
    # Jsonify data
    response = {
        'user_id' : user_id,
        'task_name' : task_name,
        'task_duration' : task_duration,
        'parent_project' : parent_project,
        'status' : 'success',
        'message' : 'task added successfully'
    }

    return jsonify(response)

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

    # Handle parent project selection
    # Get data from database

    # Get inputs if there are any
    project_description = request.form.get("project-description")
    due_date = request.form.get("due-date")
    start_date = request.form.get("start-date")

    # Add the projects to the database
    db.execute(
        "INSERT INTO projects (user_id, name, description, start_date, due_date) VALUES(?, ?, ?, ?, ?)",
        session["user_id"], project_name, project_description, start_date, due_date
        )
    return None

# def update_task():
#     # Get task name, duration, and parent project if available
#     task_name = request.form.get("edit-task-name")
        
#     # Handle no inputs
#     if not request.form.get("edit-task-duration"):
#         task_duration = 0

#     # Get data from database

#     projects = db.execute(
#         "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
#         )

#     # Get inputs if there are any
#     task_duration = request.form.get("edit-task-duration")
#     status = request.form.get("edit-status")
#     priority = request.form.get("edit-priority")
#     parent_project = request.form.get("edit-parent-project")

#     # Add the task to the database
#     db.execute(
#         "UPDATE tasks (name, duration, status, priority project_id) VALUES(?, ?, ?, ?, ?, ?) WHERE user_id = ?",
#         task_name, task_duration, status, priority, parent_project, session["user_id"]
#         )
#     return None