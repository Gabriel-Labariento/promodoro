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
    
    # Handle the addition of a new task
    if request.method == "POST":

        # Identify which form the user submitted
        form_id = request.form.get("form_id")
        if form_id == "new-task-form":
            new_task()
        # else:
        #     update_task()
        
    return render_template("index.html", pomodoro_duration=pomodoro_duration, projects=projects, tasks=tasks, project_dict=project_dict)

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
    return render_template("long.html", pomodoro_duration=pomodoro_duration)

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
    return render_template("short.html", pomodoro_duration=pomodoro_duration)

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