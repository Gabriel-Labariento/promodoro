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

$(document).ready(function(){
  $('#new-task-form').on('submit', function(event){
    event.preventDefault();

    let task_name = $('#task-name').val();
    let task_duration = $('#task-duration').val();
    let parent_project = $('#add-parent').val();

    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        task_name: task_name,
        task_duration: task_duration,
        parent_project: parent_project
      },
      success: function(response) {
        if (response.status === 'success') {
          let newTaskHtml =  `<div class="row pt-2">
                                <div class="col-md-4 offset-md-4">
                                    <a href="#" class="text-dark" data-bs-toggle="modal" data-bs-target="#editTaskModal">
                                        <div class="card text-bg-secondary task">
                                            <div class="card-body">
                                                <span class="text-light fw-bold">${response.task_name}</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>`
          $('#tasks').append(newTaskHtml);
          $('#task-name').val('');
          $('#task-duration').val('')
          $('#add-parent').val('')
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