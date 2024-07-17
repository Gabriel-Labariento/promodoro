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
    - 
