import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/task.dart';
import '../../theme/app_theme.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback? onTap;
  final VoidCallback? onToggle;

  const TaskCard({
    super.key,
    required this.task,
    this.onTap,
    this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 20),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Checkbox
            GestureDetector(
              onTap: onToggle,
              child: Container(
                width: 24,
                height: 24,
                margin: const EdgeInsets.only(top: 2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: task.isCompleted 
                      ? AppTheme.success 
                      : Colors.transparent,
                  border: Border.all(
                    color: task.isCompleted 
                        ? AppTheme.success 
                        : AppTheme.surfaceLight,
                    width: 2,
                  ),
                ),
                child: task.isCompleted
                    ? const Icon(
                        Icons.check,
                        size: 14,
                        color: Colors.white,
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 16),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    task.title,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w500,
                      color: task.isCompleted 
                          ? AppTheme.textMuted 
                          : AppTheme.textPrimary,
                      decoration: task.isCompleted 
                          ? TextDecoration.lineThrough 
                          : null,
                      height: 1.3,
                    ),
                  ),
                  if (task.listName != null || task.dueDate != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (task.listName != null) ...[
                          Icon(
                            Icons.notes,
                            size: 14,
                            color: AppTheme.textMuted,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            task.listName!,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                        if (task.dueDate != null) ...[
                          if (task.listName != null) 
                            const SizedBox(width: 12),
                          Icon(
                            Icons.access_time,
                            size: 14,
                            color: _getDueDateColor(task.dueDate!),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatDueDate(task.dueDate!),
                            style: TextStyle(
                              fontSize: 13,
                              color: _getDueDateColor(task.dueDate!),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                  // Subtasks progress
                  if (task.subtasks.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: task.progress,
                        backgroundColor: AppTheme.surfaceLight,
                        valueColor: AlwaysStoppedAnimation(
                          task.progress == 1.0 
                              ? AppTheme.success 
                              : AppTheme.primaryPurple,
                        ),
                        minHeight: 4,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getDueDateColor(DateTime dueDate) {
    final now = DateTime.now();
    if (dueDate.isBefore(now)) {
      return AppTheme.error;
    } else if (dueDate.difference(now).inDays <= 1) {
      return AppTheme.warning;
    }
    return AppTheme.textMuted;
  }

  String _formatDueDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dueDay = DateTime(date.year, date.month, date.day);
    final difference = dueDay.difference(today).inDays;

    if (difference == 0) {
      return DateFormat('h:mm a').format(date);
    } else if (difference == 1) {
      return 'Tomorrow';
    } else if (difference < 7 && difference > 0) {
      return DateFormat('EEEE').format(date);
    } else {
      return DateFormat('MMM d').format(date);
    }
  }
}
