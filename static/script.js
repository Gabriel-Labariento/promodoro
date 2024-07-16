// Javascript made with the help of ChatGPT

// Handle changing the length of timers
$(document).ready(function() {
  $('#settings_form').on('submit', function(event) {
    event.preventDefault();

    let form = $(this);
    let div = form.closest('.modal-body');
    let data = {
      pomodoroLength: div.find('input[name="pomodoroLength"]').val(),
      shortLength: div.find('input[name="shortLength"]').val(),
      longLength: div.find('input[name="longLength"]').val()
    };
    (data);

    $.ajax({
      type: 'POST',
      url: '/change_settings',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(response) {
        if (response.status === 'success') {
          $(`#settings_modal`).modal('hide');
          location.reload();
        } else {
          alert(response.message);
        }
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
});
  
// Handle the pomodoro timers
document.addEventListener('DOMContentLoaded', (event) => {
  const startButton = document.getElementById('pomoStart');
  const pauseButton = document.getElementById('pomoPause');
  let timerInterval;
  let remainingTime = pomodoroDuration * 1000; // Convert to milliseconds
  let isPaused = false;
  let endTime;
  const done = new Howl({
    src: ['static/done.mp3'] 
  });
  const hit = new Howl({
    src: ['static/hit.mp3']
  });
  

  const updateDisplay = (distance) => {
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');
  };

  const startTimer = () => {
    endTime = new Date().getTime() + remainingTime;
    timerInterval = setInterval(() => {
      if (!isPaused) {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 580){
          done.play();
          let url = window.location.href
          console.log(pomodoroCount);
          if (url.includes("short") || url.includes("long")){
              location.replace("../");
          } else {
            if (pomodoroCount < 4){
              location.replace("/short");
              pomodoroCount = pomodoroCount + 1;
            } else {
              location.replace("/long");
              pomodoroCount = 0;
            }      
          }
        }

        if (distance < 0) {
          clearInterval(timerInterval);
          document.getElementById("minutes").innerHTML = "00";
          document.getElementById("seconds").innerHTML = "00";
        } else {
          remainingTime = distance;
          updateDisplay(distance);
          (distance);
        }
      }
    }, 1000);

    // Update the display immediately without waiting for the first interval tick
    updateDisplay(remainingTime);
  };

  startButton.addEventListener('click', () => {
    isPaused = false;
    startButton.disabled = true;
    pauseButton.disabled = false;
    hit.play();
    startTimer();
  });

  pauseButton.addEventListener('click', () => {
    hit.play();
    isPaused = !isPaused;
    if (isPaused) {
      clearInterval(timerInterval);
      pauseButton.textContent = 'Resume Timer';
    } else {
      endTime = new Date().getTime() + remainingTime;
      pauseButton.textContent = 'Pause';
      startTimer();
    }
  });

    window.addEventListener('keydown', function(event){
      if(event.key == " "){
        hit.play();
          if (!startButton.disabled){
              isPaused = false;
              startButton.disabled = true;
              pauseButton.disabled = false;
              startTimer();
          } else {
          hit.play();
              isPaused = !isPaused;
              (isPaused);
              if (isPaused) {
                  clearInterval(timerInterval);
                  pauseButton.textContent = 'Resume Timer';
              } else {
                  endTime = new Date().getTime() + remainingTime;
                  startTimer();
                  pauseButton.textContent = 'Pause';
              }
          }
      }
  });


});

// Handle task addition without reloading page
$(document).ready(function(){
  $('#new-task-form').on('submit', function(event){
    event.preventDefault();

    let task_name = $('#task_name').val();
    let task_duration = $('#task_duration').val();
    let parent_project = $('#parent_project').val();
    let task_status = 'In Progress';
    let task_priority = 'Medium'; 

    $.ajax({
      type: 'POST',
      url: '/add_task',
      data: {
        task_name: task_name,
        task_duration: task_duration,
        parent_project: parent_project,
        task_status: task_status,
        task_priority: task_priority
      },
      success: function(response) {
        if (response.status === 'success') {
          // Create a list of dictionaries where key = project_id and value = project_name
          let projects = response.projects;

          let newTaskHtmlMain = `<div id="index-row-${response.task_id}" class="row pt-2">
                                <div class="col-md-4 offset-md-4">
                                    <div class="card text-bg-secondary task">
                                        <div class="card-body d-flex justify-content-between align-items-center">
                                            <a href="#" class="text-light fw-bold task-name" id="task-card-${response.task_id}" data-bs-toggle="modal" data-bs-target="#editTaskModal-${response.task_id}" data-task-id="${response.task_id}">
                                                ${response.task_name}
                                            </a>
                                            <form action="/remove_task" name="remove_task" method="post">
                                                <input type="hidden" name="remove_task_button" value="${response.task_id}">
                                                <button class="btn btn-light" type="submit"><i class="bi bi-check2-square"></i></button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                            <div id="editTaskModal-${response.task_id}" class="modal fade" tabindex="-1">
                                <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Edit Task</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <form id="edit-task-form-${response.task_id}" name="edit_task_form" method="post">
                                                <input type="hidden" name="form_id" value="edit_task_form">
                                                <input type="hidden" id="edit_task_id-${response.task_id}" name="edit_task_id" value="${response.task_id}">
                                                <div class="mb-3">
                                                    <label for="edit_task_name-${response.task_id}" class="form-label">Task Name</label>
                                                    <input type="text" class="form-control" id="edit_task_name-${response.task_id}" name="edit_task_name" value="${response.task_name}" required>
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_task_duration-${response.task_id}" class="form-label">Duration (minutes)</label>
                                                    <input type="number" class="form-control" id="edit_task_duration-${response.task_id}" name="edit_task_duration" value="${response.task_duration}">
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_status-${response.task_id}" class="form-label">Status</label>
                                                    <select id="edit_status-${response.task_id}" name="edit_status" class="form-select">
                                                        <option selected>Not Started</option>
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Finished">Finished</option>
                                                    </select>
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_priority-${response.task_id}" class="form-label">Priority</label>
                                                    <select id="edit_priority-${response.task_id}" name="edit_priority" class="form-select">
                                                        <option selected>Low</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                </div>`

          let editTaskModalMain = `<div id="editTaskModal-${response.task_id}" class="modal fade" tabindex="-1">
                                <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Edit Task</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <form id="edit-task-form-${response.task_id}" name="edit_task_form" method="post">
                                                <input type="hidden" name="form_id" value="edit_task_form">
                                                <input type="hidden" id="edit_task_id-${response.task_id}" name="edit_task_id" value="${response.task_id}">
                                                <div class="mb-3">
                                                    <label for="edit_task_name-${response.task_id}" class="form-label">Task Name</label>
                                                    <input type="text" class="form-control" id="edit_task_name-${response.task_id}" name="edit_task_name" value="${response.task_name}" required>
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_task_duration-${response.task_id}" class="form-label">Duration (minutes)</label>
                                                    <input type="number" class="form-control" id="edit_task_duration-${response.task_id}" name="edit_task_duration" value="${response.task_duration}">
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_task_due-${response.task_id}" class="form-label">Due Date</label>
                                                    <input type="date" class="form-control" id="edit_task_due-${response.task_id}" name="edit_task_due" value="${response.task_id}">
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_status-${response.task_id}" class="form-label">Status</label>
                                                    <select id="edit_status-${response.task_id}" name="edit_task_status" class="form-select">
                                                        <option selected>Not Started</option>
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Finished">Finished</option>
                                                    </select>
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_priority-${response.task_id}" class="form-label">Priority</label>
                                                    <select id="edit_priority-${response.task_id}" name="edit_task_priority" class="form-select">
                                                        <option selected>Low</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                </div>`;
                                                
          let selectProjectsMain =  `<div class="mb-3">
                                  <label for="edit_parent_project-${response.task_id}" class="form-label">Parent Project</label>
                                    <select id="edit_parent_project-${response.task_id}" name="edit_parent_project" class="form-select">
                                        <option value="${response.parent_project}" selected>${response.parent_project_name[0]["name"]}</option>
                                   `;
          
          // Will consitute the project select field
          selectProjectList = ``

          for (let i = 0; i < projects.length; i++){
            if (projects[i].id != response.parent_project){
            selectProjectList += `<option value="${projects[i].id}">${projects[i].name}</option>`
            };
          }

          let editTaskFooter =  `</select>
                                </div>
                                    <div class="modal-footer">
                                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                      <button type="submit" name="save_changes" value="submit" class="btn btn-primary">Save changes</button>
                                    </div>
                                  </form>
                                  </div>
                                </div>
                              </div>
                            </div>`;
                            
          let newTaskRowHtml = `
                            <tr id="taskRow-${response.task_id}" data-task-id="${response.task_id}">
                              <td>${response.task_name}</td>
                              <td></td>
                              <td>${response.task_status}</td>
                              <td>${response.task_priority}</td>
                              <td>${response.parent_project ? response.parent_project_name : 'None'}</td>
                              <td>
                               <div class="d-flex align-items-center">
                                  <a href="#" class="text-dark" data-bs-toggle="modal" data-bs-target="#editTaskModal-${response.task_id}" data-task-id="${response.task_id}"><i class="bi bi-pen-fill"></i></a>
                                  <form action="/remove_task" name="remove_task" method="post">
                                    <input type="hidden" name="remove_task_button" value="${response.task_id}">
                                  <button class="btn btn-light" type="submit"><i class="bi bi-check2-square"></i></button>
                                  </form>
                                </div>
                             </td>
                               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <form id="edit-task-form-${response.task_id}" name="edit_task_form" method="post">
                                            <form id="edit-task-form-${response.task_id}" name="edit_task_form" method="post" action="/edit_task">
                                                <input type="hidden" name="form_id" value="edit_task_form">
                                                <input type="hidden" id="edit_task_id" name="task_id" value="${response.task_id}">
                                                <div class="mb-3"> `;

          $('#tasks').append(newTaskHtmlMain + selectProjectsMain + selectProjectList + editTaskFooter);
          $('#taskTableBody').append(newTaskRowHtml);
          $('#taskPageTasks').append(editTaskModalMain + selectProjectsMain + selectProjectList + editTaskFooter);
          $('#editTaskModal').append(editTaskModalMain + selectProjectsMain + selectProjectList + editTaskFooter);
          $('#task_name').val('');
          $('#task_duration').val('');
          $('#parent_project').val('');
          $('#taskModal').modal('hide');
        } else {
          alert(response.message);
        }
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
});

// Handle task editing without reloading page
  $(document).ready(function() {
    $('body').on('submit', 'form[name="edit_task_form"]', function(event) {
      event.preventDefault();
  
      let form = $(this);
      let div = form.closest('.modal-body');
      let taskId = div.find('input[name="edit_task_id"]').val();
      let taskName = div.find('input[name="edit_task_name"]').val();
      let taskDuration = div.find('input[name="edit_task_duration"]').val();
      let taskDue = div.find('input[name="edit_task_due"]').val();
      let taskStatus = div.find('select[name="edit_task_status"]').val();
      let taskPriority = div.find('select[name="edit_task_priority"]').val();
      let parentProject = div.find('select[name="edit_parent_project"]').val();
  
      $.ajax({
        type: 'POST',
        url: '/edit_task',
        data: {
          edit_task_id: taskId,
          edit_task_name: taskName,
          edit_task_duration: taskDuration,
          edit_task_due: taskDue,
          edit_task_status: taskStatus,
          edit_task_priority: taskPriority,
          edit_parent_project: parentProject
        },
        success: function(response) {
          if (response.status === 'success') {
            // Update the task in the UI
            let taskRow = $(`#taskRow-${response.task_id}`);
            taskRow.find('td').eq(0).text(response.task_name);
            taskRow.find('td').eq(1).text(response.task_due);
            taskRow.find('td').eq(2).text(response.task_status);
            taskRow.find('td').eq(3).text(response.task_priority);
            taskRow.find('td').eq(4).text(response.parent_project ? response.parent_project_name : 'None');

            // Reload the page if the page is the tasks page
            let url = window.location.href;
            if (url.includes("tasks")){
              window.location.reload();
            }
  
            let taskCard = $(`#task-card-${response.task_id}`);
            taskCard.find('.task-name').text(response.task_name);
  
            // Close the modal
            $(`#editTaskModal-${response.task_id}`).modal('hide');
          } else {
            alert(response.message);
          }
        },
        error: function(error) {
          console.log(error);
        }
      });
    });
  });

// Handle task clearing without reloading page
$(document).ready(function() {
  $('body').on('submit', 'form[name="remove_task"]', function(event) {
    event.preventDefault();

    let form = $(this);
    let task_id = form.find('input[name="remove_task_button"]').val();
    (task_id);

    $.ajax({
      type: 'POST',
      url: '/remove_task',
      data: {
        remove_task_button: task_id
      },
      success: function(response) {
        if (response.status === 'success') {
          let taskRow = $(`#taskRow-${response.task_id}`);
          let indexRow = $(`#index-row-${response.task_id}`);
          taskRow.remove();
          indexRow.remove();

        }
        else {
          alert(response.message);
        }
      },
      error: function(error) {
        console.log(error);
      }
      });
    });
  });

// Handle project clearing without reloading page
$(document).ready(function() {
  $('body').on('submit', 'form[name="remove_project"]', function(event) {
    event.preventDefault();

    let form = $(this);
    let project_id = form.find('input[name="remove_project_button"]').val();

    $.ajax({
      type: 'POST',
      url: '/remove_project',
      data: {
        remove_project_button: project_id
      },
      success: function(response) {
        if (response.status === 'success') {
          let projectRow = $(`#project-row-${response.project_id}`);
          projectRow.remove();
        }
        else {
          alert(response.message);
        }
      },
      error: function(error) {
        console.log(error);
      }
      });
    });
  });