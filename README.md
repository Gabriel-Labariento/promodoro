# PROMODORO
#### Video Demo:  <URL HERE>
#### Description: This Pomodoro Productivity App is a web-based application designed to help users manage their tasks and projects effectively and work using the Pomodoro Technique. It allows users to add, edit, and remove tasks and projects, track their progress, and customize their Pomodoro timer settings. Tasks are associated with projects and users can view the parent project of each task as well as the children tasks linked with each project. AJAX was used to dynamically change the webpage according to user input. Timers lengths can also be dynamically altered.

#### The web application includes a user registration and login page so that user data can be kept. Design and ideas were influenced by CS50's Finance Problem Set. Each task and project is editable through a task/project modal. Each modal is specific to its parent task. After each pomodoro session, the page URL is automatically assigned to the short break page. After the short break, the URL is assigned back to the pomodoro page. After 4 pomodoro sessions, the URL is assigned to the long break page instead of the short break page.

#### Features
- User Authentication: Secure login and registration functionality.
- Task Management: Add, edit, and remove tasks.
- Project Management: Add, edit, and remove projects. Tasks can be associated with projects.
- Timer Customization: Users can customize Pomodoro duration, short break, and long break durations.
- AJAX Integration: Perform CRUD operations without reloading the page.

#### Technologies Used
- Frontend: HTML, CSS, JavaScript, Bootstrap 5
- Backend: Python, Flask
- Database: SQLite
- AJAX: jQuery

#### Files Included
- #### script.js
    - Handles dynamic timer length input
    - Handles timer display for focus page, short break page, and long break page.
    - Handles task addition without page reload through AJAX for focus page, short break page, and long break page.
    - Handles task editing without reloading page. Also dynamically alters task-edit modals (e.g. addition of a new project must change the select field for task parent project)
    -  Handles task and project clearing/removal without page reload.

- #### styles.css
    - Describes styling for selected elements

- #### helpers.py
    - Includes login_required helper function inspired by CS50 Finance
    - Inludes new project function definition. Projects can only be viewed in the project page. Page can simply be reloaded if changes are made since there is no timer in this page.

- #### app.py
    - Includes app routes: default, change settings, add_task, edit_task, remove_project, remove_task, login, logout, register, short/long break page, projects page, and tasks page
    - sets database
    - sets session

- #### promodoro.db
    - main database for the project
    - includes 4 tables: tasks, projects, users, and timer.

- #### templates
    - #### edit-project-modal.html
        - allows the user to edit projects
    - #### edit-task-modal.html
        - allows the user to edit tasks
    - #### index.html
        - focus page of the project, displays a playable and pausable timer set to 25 minutes by default. 
        - displays current tasks of the user
    - #### layout.html
        - main layout of the project, inspired by CS50's Finance.
        - includes links and scripts
    - #### login.html
        - includes a form that allows the user to login if they already have an account.
        - will not log user in if the details do not exist in the database.
    - #### long.html
        - what the webpage will display if the user is on a long break.
        - long breaks are set to 15 minutes by default.
        - displays current tasks of the user.
    - #### project_info.html
        - modal that displays when a project is clicked on.
        - displays the project description and the tasks associated with the project.
    - #### project-modal.html
        - displays a form that allows the user to add a new project.
    - #### projects.html
        - page that displays all the projects of the user in a table. 
        - the table displays information: project status, project priority, project start date, and project due date.
        - users can clear/remove projects from this page. 
        - only projects with all tasks cleared can be removed.
    - #### register.html
        - creates a new user account with the following information: user email, user name, and password.
        - error will be thrown if username is already taken.
        - error will be thrown if password and confirmation password do not match.
    - #### settings-modal.html
        - displays a form when the settings tab is clicked.
        - form contains number inputs that determine how long the user wants the timers to be (in minutes)
        - information is then store in the database and retrieved by app.py
    - #### short.html
        - what the webpage will display of the user is on a short break,
        - short breaks are set to 5 minutes by default.
        - displays current tasks of the user.
    - #### task-modal.html
        - displays a form in a modal that allows the user to add a new task.
    - #### tasks.html
        - page that displays all the tasks of the user in a table.
        - the table displays information: task name, due date, status, priority, and parent project.
        - tasks are editable and removable from this page.
        - tasks can be added from this page.
    
#### Note
- This is the first coding project that I built from scratch. I want to thank CS50 for making available the resources I needed to learn to build this project. This project was heavily inspired by pomofocus.io.a  