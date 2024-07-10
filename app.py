import os
import datetime
from cs50 import SQL
from flask import Flask, session, redirect, url_for, request, render_template, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import login_required, new_project

app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False

# Initialize the extension
Session(app)

# Initialize database
db = SQL("sqlite:///promodoro.db")

@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    # set timer length
    pomodoro_duration = db.execute("SELECT pomodoro FROM timer WHERE user_id = ?", session["user_id"])
    pomodoro_duration = pomodoro_duration[0]["pomodoro"]
    pomodoro_duration *= 60

    # Retrieve projects and tasks for the logged-in user

    projects = db.execute("SELECT * FROM projects WHERE user_id = ?", session["user_id"])
    tasks = db.execute("SELECT * FROM tasks WHERE user_id = ?", session["user_id"])
    project_dict = db.execute("SELECT id, name FROM projects WHERE projects.user_id = ?", session["user_id"])
    
    return render_template("index.html", db=db, pomodoro_duration=pomodoro_duration, projects=projects, tasks=tasks, project_dict=project_dict)

@app.route("/change_settings", methods=["POST"])
@login_required
def change_settings():
    data = request.json
    pomodoroLength = data.get("pomodoroLength", 25)
    shortLength = data.get("shortLength", 5)
    longLength = data.get("longLength", 15)
        
    user_id = session["user_id"]

    # Update the database of timers:
    db.execute("UPDATE timer SET pomodoro = ?, short = ?, long = ? WHERE user_id = ?", pomodoroLength, shortLength, longLength, user_id)

    response = {
        'user_id': user_id,
        'pomodoroLength': pomodoroLength,
        'shortLength': shortLength,
        'longLength': longLength,
        'status': 'success'
    }
    return jsonify(response)

@app.route('/add_task', methods=['POST'])
@login_required
def add_task():
    task_name = request.form.get('task_name')
    task_duration = request.form.get('task_duration')
    parent_project = request.form.get('parent_project')

    # Validate the form input
    if not task_name:
        return jsonify({'status': 'error', 'message': 'Task name is required'})
    
    if not task_duration:
        task_duration = 0

    if not parent_project or parent_project == '':
        parent_project = None

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    # Insert the new task into the database
    if parent_project is None:
        db.execute("INSERT INTO tasks (user_id, name, duration) VALUES (?, ?, ?)", user_id, task_name, task_duration)
    else:
        db.execute("INSERT INTO tasks (user_id, name, duration, project_id) VALUES (?, ?, ?, ?)", user_id, task_name, task_duration, parent_project)

    task_id = db.execute("SELECT last_insert_rowid()")[0]['last_insert_rowid()']

    # Select the task's parent project
    parent_project_name = db.execute("SELECT name FROM projects WHERE id = ? AND user_id = ?", parent_project, session["user_id"])
    parent_project_name = parent_project_name[0]["name"]
    if not parent_project_name:
        parent_project_name = 'No Parent Project'

    # Select all the projects currently in the database
    projects = db.execute("SELECT id, name FROM projects WHERE user_id = ?", session["user_id"])
    
    response = {
        'user_id': user_id,
        'task_id': task_id,
        'task_name': task_name,
        'task_duration': task_duration,
        'task_status': 'In Progress',
        'task_priority': 'Medium',
        'parent_project': parent_project,
        'parent_project_name': parent_project_name,
        'projects': projects,
        'status': 'success',
        'message': 'Task added successfully'
    }
    return jsonify(response)

@app.route('/edit_task', methods=['POST'])
@login_required
def edit_task():
    task_id = request.form.get('edit_task_id')
    task_name = request.form.get('edit_task_name')
    task_duration = request.form.get('edit_task_duration')
    task_status = request.form.get('edit_task_status')
    task_priority = request.form.get('edit_task_priority')
    parent_project = request.form.get('edit_parent_project')
    task_due = request.form.get('edit_task_due')

    if not parent_project or parent_project == '':
        parent_project = None
    else:
        # Verify if the parent project exists
        project_exists = db.execute("SELECT id FROM projects WHERE id = ?", parent_project)
        if not project_exists:
            parent_project = None

    try:
        # Update the task in the database
        if parent_project is None:
            db.execute("UPDATE tasks SET name = ?, duration = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?", task_name, task_duration, task_status, task_priority, task_due, task_id, session["user_id"])
        else:
            db.execute("UPDATE tasks SET name = ?, duration = ?, status = ?, priority = ?, project_id = ?, due_date = ? WHERE id = ? AND user_id = ?", task_name, task_duration, task_status, task_priority, parent_project, task_due, task_id, session["user_id"])

        response = {
            'status': 'success',
            'task_id': task_id,
            'task_name': task_name,
            'task_duration': task_duration,
            'task_status': task_status,
            'task_priority': task_priority,
            'task_due': task_due,
            'parent_project': parent_project,
            'user_id': session["user_id"]
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
    
@app.route('/remove_project', methods=['POST'])
@login_required
def remove_project():
    project_id = request.form.get("remove_project_button")
    if project_id:
        try:
            db.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", project_id, session["user_id"])
            response = {
                'status': 'success',
                'project_id' : project_id
            }
            return jsonify(response)
        
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)})
    else: 
        return 'Error: Project ID not Found', 400

@app.route('/remove_task', methods=['POST'])
@login_required
def remove_task():
    task_id = request.form.get("remove_task_button")
    if task_id: 
        try:
            db.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", task_id, session["user_id"])

            response = {
                'status': 'success',
                'task_id' : task_id
            }
            return jsonify(response)
        
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)})
    else: 
        return 'Error: Task ID not Found', 400
    

@app.route("/login", methods=["GET", "POST"])
def login():
    # Forget any user id
    session.clear()

    if request.method == 'POST':
        username = request.form.get("username")
        password = request.form.get("password")

        # Check for empty inputs
        if not username:
            return "Empty username field", 400
        if not password:
            return "Empty password field", 400

        # Select user from the database
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            return "Sorry about that, incorrect username and/or password.", 400

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]
        return redirect("/")

    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

@app.route("/long")
@login_required
def long():
    # Set duration of pomodoro timer for long break
    pomodoro_duration = db.execute("SELECT long FROM timer WHERE user_id = ?", session["user_id"])
    pomodoro_duration = pomodoro_duration[0]["long"]
    pomodoro_duration *= 60

    # Retrieve projects and tasks for the logged-in user
    projects = db.execute("SELECT * FROM projects WHERE user_id = ?", session["user_id"])
    tasks = db.execute("SELECT * FROM tasks WHERE user_id = ?", session["user_id"])
    project_dict = db.execute("SELECT id, name FROM projects WHERE projects.user_id = ?", session["user_id"])

    return render_template("long.html", pomodoro_duration=pomodoro_duration, project_dict=project_dict, tasks=tasks, projects=projects)

@app.route("/projects", methods=["GET", "POST"])
@login_required
def projects():
    # Handle the addition of a new project
    if request.method == "POST":
        return new_project()

    tasks = db.execute("SELECT * FROM tasks WHERE user_id = ?", session["user_id"])
    projects = db.execute("SELECT * FROM projects WHERE user_id = ?", session["user_id"])

    projectHasTasks = False

    return render_template("projects.html", projects=projects, tasks=tasks, projectHasTasks=projectHasTasks)

@app.route("/register", methods=["GET", "POST"])
def register():
    session.clear()

    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        confirmPassword = request.form.get("confirm-password")

        # Ensure required fields were submitted
        if not username:
            return "must provide username", 400
        if not email:
            return "must provide email", 400
        if not password:
            return "must provide password", 400
        if not confirmPassword:
            return "must provide password confirmation", 400

        # Ensure password and confirmation match
        if password != confirmPassword:
            return "Password and confirmation must match", 400

        try:
            # Register the user
            db.execute("INSERT INTO users (email, username, hash) VALUES(?, ?, ?)", email, username, generate_password_hash(password, method="pbkdf2", salt_length=16))
        except ValueError:
            return "Sorry, something went wrong while trying to register. Try another username.", 400

        # Log user in
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)
        session["user_id"] = rows[0]["id"]

        db.execute("INSERT INTO timer (user_id) VALUES(?)", session["user_id"])

        return redirect("/")

    return render_template("register.html")

# @app.route("/set_timer", methods=["POST"])
# def set_timer():

@app.route("/short", methods=["GET", "POST"])
@login_required
def short():
    # Set duration of pomodoro timer for short break
    pomodoro_duration = db.execute("SELECT short FROM timer WHERE user_id = ?", session["user_id"])
    pomodoro_duration = pomodoro_duration[0]["short"]
    pomodoro_duration *= 60

    # Retrieve projects and tasks for the logged-in user
    projects = db.execute("SELECT * FROM projects WHERE user_id = ?", session["user_id"])
    tasks = db.execute("SELECT * FROM tasks WHERE user_id = ?", session["user_id"])
    project_dict = db.execute("SELECT id, name FROM projects WHERE projects.user_id = ?", session["user_id"])

    return render_template("short.html", pomodoro_duration=pomodoro_duration, projects=projects, tasks=tasks, project_dict=project_dict)

@app.route("/tasks", methods=["GET", "POST"])
@login_required
def tasks():

    tasks = db.execute("SELECT * FROM tasks WHERE user_id = ?", session["user_id"])
    projects = db.execute("SELECT * FROM projects WHERE user_id = ?", session["user_id"])
    project_dict = db.execute("SELECT id, name FROM projects WHERE projects.user_id = ?", session["user_id"])

    return render_template("tasks.html", db=db, tasks=tasks, projects=projects, project_dict=project_dict)

