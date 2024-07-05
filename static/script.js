// Javascript made with the help of ChatGPT

// Handle the pomodoro timers
document.addEventListener('DOMContentLoaded', (event) => {
  const startButton = document.getElementById('pomoStart');
  const pauseButton = document.getElementById('pomoPause');
  let timerInterval;
  let remainingTime = pomodoroDuration * 1000; // Convert to milliseconds
  let isPaused = false;
  let endTime;

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

        if (distance < 0) {
          clearInterval(timerInterval);
          document.getElementById("minutes").innerHTML = "00";
          document.getElementById("seconds").innerHTML = "00";
        } else {
          remainingTime = distance;
          updateDisplay(distance);
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
    startTimer();
  });

  pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      clearInterval(timerInterval);
      pauseButton.textContent = 'Resume Timer';
    } else {
      endTime = new Date().getTime() + remainingTime;
      startTimer();
      pauseButton.textContent = 'Pause Timer';
    }
  });

    window.addEventListener('keydown', function(event){
      if(event.key == " "){
          if (!startButton.disabled){
              isPaused = false;
              startButton.disabled = true;
              pauseButton.disabled = false;
              startTimer();
          } else {
              isPaused = !isPaused;
              if (isPaused) {
                  clearInterval(timerInterval);
                  pauseButton.textContent = 'Resume Timer';
              } else {
                  endTime = new Date().getTime() + remainingTime;
                  startTimer();
                  pauseButton.textContent = 'Pause Timer';
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
          let newTaskHtml = `<div class="row pt-2">
                                <div class="col-md-4 offset-md-4">
                                    <a href="#" id="task-card-${response.task_id}" class="text-dark" data-bs-toggle="modal" data-bs-target="#editTaskModal-${response.task_id}" data-task-id="${response.task_id}">
                                        <div class="card text-bg-secondary task">
                                            <div class="card-body">
                                                <span class="text-light fw-bold task-name">${response.task_name}</span>
                                            </div>
                                        </div>
                                    </a>
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
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_parent_project-${response.task_id}" class="form-label">Parent Project</label>
                                                    <select id="edit_parent_project-${response.task_id}" name="edit_parent_project" class="form-select">
                                                          <option value="" selected>No Parent Project</option>
                                                          {% for project in projects %}
                                                          <option value="{{ project.id }}">{{ project.name }}</option>
                                                          {% endfor %}
                                                    </select>
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
          let editTaskModal = `<div id="editTaskModal-${response.task_id}" class="modal fade" tabindex="-1">
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
                                                </div>
                                                <div class="mb-3">
                                                    <label for="edit_parent_project-${response.task_id}" class="form-label">Parent Project</label>
                                                    <select id="edit_parent_project-${response.task_id}" name="edit_parent_project" class="form-select">
                                                          <option value="" selected>No Parent Project</option>
                                                          {% for project in projects %}
                                                          <option value="{{ project.id }}">{{ project.name }}</option>
                                                          {% endfor %}
                                                    </select>
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

          $('#tasks').append(newTaskHtml);
          $('#taskPageTasks').append(editTaskModal);
          $('#editTaskModal').append(editTaskModal);
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

  //   // Function to handle task editing without reloading page
  //   function bindEditTaskForm(task_id) {
  //     $(`#edit-task-form-${response.task_id}`).on('submit', function(event) {
  //         event.preventDefault();

  //         let task_name = $(`#edit_task_name-${response.task_id}`).val();
  //         let task_duration = $(`#edit_task_duration-${response.task_id}`).val();
  //         let task_status = $(`#edit_status-${response.task_id}`).val();
  //         let task_priority = $(`#edit_priority-${response.task_id}`).val();
  //         let parent_project = $(`#edit_parent_project-${response.task_id}`).val();

  //         $.ajax({
  //             type: 'POST',
  //             url: '/edit_task',
  //             data: {
  //                 task_id: task_id,
  //                 task_name: task_name,
  //                 task_duration: task_duration,
  //                 task_status: task_status,
  //                 task_priority: task_priority,
  //                 parent_project: parent_project
  //             },
  //             success: function(response) {
  //                 if (response.status === 'success') {
  //                     // Update task details in the UI
  //                     $(`#taskRow-${task_id}`).find('.task-name').text(response.task_name);
  //                     $(`#taskRow-${task_id}`).find('.task-duration').text(response.task_duration);
  //                     $(`#taskRow-${task_id}`).find('.task-status').text(response.task_status);
  //                     $(`#taskRow-${task_id}`).find('.task-priority').text(response.task_priority);
  //                     $(`#editTaskModal-${task_id}`).modal('hide');

  //                     // Update the parent project name if necessary
  //                     if (response.parent_project) {
  //                         let projectName = $(`#edit_parent_project-${task_id} option[value="${response.parent_project}"]`).text();
  //                         $(`#taskRow-${task_id}`).find('.task-project').text(projectName);
  //                     } else {
  //                         $(`#taskRow-${task_id}`).find('.task-project').text('No Parent Project');
  //                     }
  //                 } else {
  //                     alert(response.message);
  //                 }
  //             },
  //             error: function(error) {
  //                 console.log(error);
  //             }
  //         });
  //     });
  // }

  // // Bind the edit task form submit event for existing tasks on page load
  // $('form[name="edit_task_form"]').each(function() {
  //     let task_id = $(this).find('input[name="task_id"]').val();
  //     bindEditTaskForm(task_id);
  // });

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
  
      console.log(taskId);

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
  