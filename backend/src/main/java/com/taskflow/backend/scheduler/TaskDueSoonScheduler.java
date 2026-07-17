package com.taskflow.backend.scheduler;

import com.taskflow.backend.domain.Task;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Hourly sweep that notifies task assignees when their task is due
 * within the next 24 hours. Duplicate-prevention (max one notification
 * per task per 24-hour window) is handled inside
 * NotificationService.notifyTaskDueSoon(), not here â€” this class only
 * finds candidate tasks and delegates.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskDueSoonScheduler {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 * * * *") // every hour, on the hour
    public void notifyTasksDueSoon() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        List<Task> dueSoonTasks = taskRepository.findTasksDueSoonForScheduler(today, tomorrow);

        log.info("TaskDueSoonScheduler: found {} task(s) due within 24 hours", dueSoonTasks.size());

        for (Task task : dueSoonTasks) {
            notificationService.notifyTaskDueSoon(
                    task.getAssigneeId(),
                    task.getId(),
                    task.getProjectId(),
                    task.getTitle()
            );
        }
    }
}