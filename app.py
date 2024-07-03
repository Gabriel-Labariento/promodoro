import os 
import datetime

from cs50 import SQL
from flask import Flask, session, redirect, url_for, request, render_template, jsonify
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import login_required, new_task, new_project

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
    # Set duration of pomodoro timer
    pomodoro_duration = 25 * 60

    projects = db.execute(
            "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
            )
    
    tasks = db.execute(
        "SELECT * FROM tasks WHERE user_id = ?", session["user_id"]
    )

    project_dict = db.execute(
        "SELECT id, name FROM projects WHERE projects.user_id = ? ",
        session["user_id"]
        )
         
    return render_template("index.html", pomodoro_duration=pomodoro_duration, projects=projects, tasks=tasks, project_dict=project_dict)

@app.route('/add_task', methods=['POST'])
def add_task():
    if not request.form.get('task_name'):
        return "failed to get task name"
    if not request.form.get('task_duration'):
        task_duration = 0
    if not request.form.get('parent_project') or request.form.get('parent-project') == '':
        parent_project = ''

    task_name = request.form.get('task_name')
    task_duration = request.form.get('task_duration')
    parent_project = request.form.get('parent_project')

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({'status': 'error', 'message': 'User not logged in'})

    if parent_project == '':
        db.execute(
            "INSERT INTO tasks (user_id, name, duration) VALUES (?, ?, ?)",
            session["user_id"], task_name, task_duration)
    else:
        db.execute( 
            "INSERT INTO tasks (user_id, name, duration, project_id) VALUES (?, ?, ?, ?)",
              session["user_id"], task_name, task_duration, parent_project)

    task_id = db.execute("SELECT last_insert_rowid()")[0]['last_insert_rowid()']
    
    response = {
        'user_id': user_id,
        'task_id': task_id,
        'task_name': task_name,
        'task_duration': task_duration,
        'parent_project': parent_project,
        'status': 'success',
        'message': 'Task added successfully'
    }
    return jsonify(response)

@app.route('/edit_task', methods=['POST'])
@login_required
def edit_task():
    task_id = request.form.get('task_id')
    task_name = request.form.get('task_name')
    task_duration = request.form.get('task_duration')
    task_status = request.form.get('task_status')
    task_priority = request.form.get('task_priority')
    parent_project = request.form.get('parent_project')

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
            db.execute(
                "UPDATE tasks SET name = ?, duration = ?, status = ?, priority = ? WHERE id = ? AND user_id = ?",
                task_name, task_duration, task_status, task_priority, task_id, session["user_id"]
            )
        else:
            db.execute(
                "UPDATE tasks SET name = ?, duration = ?, status = ?, priority = ?, project_id = ? WHERE id = ? AND user_id = ?",
                task_name, task_duration, task_status, task_priority, parent_project, task_id, session["user_id"]
            )
        
        # Prepare the response
        response = {
            'status': 'success',
            'task_id': task_id,
            'task_name': task_name,
            'task_duration': task_duration,
            'task_status': task_status,
            'task_priority': task_priority,
            'parent_project': parent_project,
            'user_id': session["user_id"]
        }
        return jsonify(response)

    except Exception as e:
        # Handle any errors that occur
        return jsonify({'status': 'error', 'message': str(e)})
    

@app.route("/login", methods =["GET", "POST"])
def login():
    # Forget any user id
    session.clear()
    
    if request.method == 'POST':
        # Check for empty inputs
        if not request.form.get("username"):
            return "Empty username field", 400
        
        if not request.form.get("password"):
            return "Empty password field", 400
        
        # Retrieve username and password from form
        username = request.form.get("username")
        password = request.form.get("password")

        # Select user from the database
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", username
            )
    
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], password
        ):
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
    pomodoro_duration = 15 * 60

    projects = db.execute(
            "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
            )
    
    tasks = db.execute(
        "SELECT * FROM tasks WHERE user_id = ?", session["user_id"]
    )

    project_dict = db.execute(
        "SELECT id, name FROM projects WHERE projects.user_id = ? ",
        session["user_id"]
        )
    
    return render_template("long.html", pomodoro_duration=pomodoro_duration, project_dict=project_dict, tasks=tasks, projects=projects)

@app.route("/projects", methods=["GET","POST"])
@login_required
def projects():
    # Handle the addition of a new project
    if request.method == "POST":
        new_project()
    
    projects = db.execute(
        "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
        )
    
    return render_template("projects.html", projects=projects)

@app.route("/register", methods=["GET", "POST"])
def register():

    session.clear()

    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return "must provide username", 400
        
        # Ensure email was submitted
        elif not request.form.get("email"):
            return "must provide email", 400
        
        # Ensure password was submitted
        elif not request.form.get("password"):
            return "must provide password", 400

        # Ensure password confimation was submitted
        elif not request.form.get("confirm-password"):
            return "must provide password confirmation", 400
        
        # Ensure that password and password confirmation are the same
        email = request.form.get("email")
        username = request.form.get("username")
        password = request.form.get("password")
        confirmPassword = request.form.get("confirm-password")

        if password != confirmPassword:
            return "Password and confirmation must match", 400
        
        try:
            # If all checks passed try to register the user
            db.execute(
                "INSERT INTO users (email, username, hash) VALUES(?, ?, ?)",
                email, username,
                generate_password_hash(password, method="pbkdf2", salt_length=16),
            )
        except ValueError:
            return "Sorry, something went wrong while trying to register. Try another username.", 400
        
        # Log user in
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        session["user_id"] = rows[0]["id"]
        return redirect("/")

    return render_template("register.html")

@app.route("/short")
@login_required
def short():
    pomodoro_duration = 5 * 60

    projects = db.execute(
            "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
            )
    
    tasks = db.execute(
        "SELECT * FROM tasks WHERE user_id = ?", session["user_id"]
    )

    project_dict = db.execute(
        "SELECT id, name FROM projects WHERE projects.user_id = ? ",
        session["user_id"]
        )
    
    return render_template("short.html", pomodoro_duration=pomodoro_duration, projects=projects, tasks=tasks, project_dict=project_dict)

@app.route("/tasks", methods=["GET", "POST"])
@login_required
def tasks():
    
    if request.method == "POST":
        new_task()
    
    tasks = db.execute(
        "SELECT name, project_id, due_date, status, priority FROM tasks WHERE user_id = ?",
        session["user_id"]
        )

    projects = db.execute(
        "SELECT * FROM projects WHERE user_id = ?", session["user_id"]
        )
    
    # Create a dictionary of project id : project name
    project_dict = db.execute(
        "SELECT id, name FROM projects WHERE projects.user_id = ? ",
        session["user_id"]
        )

    # return f"{project_dict}"
    return render_template("tasks.html", tasks=tasks, projects=projects, project_dict=project_dict)