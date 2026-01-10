import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/task_provider.dart';
import '../widgets/tasks/task_card.dart';
import '../widgets/common/gradient_card.dart';

class TasksScreen extends StatelessWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      body: SafeArea(
        child: Consumer<TaskProvider>(
          builder: (context, taskProvider, _) {
            return CustomScrollView(
              slivers: [
                // Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Tasks',
                              style: TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.sort, color: AppTheme.textSecondary),
                                  onPressed: () {},
                                ),
                                PopupMenuButton<String>(
                                  icon: const Icon(Icons.more_vert, color: AppTheme.textSecondary),
                                  color: AppTheme.backgroundCard,
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(value: 'creation', child: Text('Creation date')),
                                    const PopupMenuItem(value: 'due', child: Text('Due date')),
                                    const PopupMenuItem(value: 'priority', child: Text('Priority')),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        // Info Card
                        SolidCard(
                          color: AppTheme.surfaceDark,
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryPurple.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.info_outline,
                                  color: AppTheme.primaryPurple,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Text(
                                  'View, sort, and access all of your tasks in one place',
                                  style: TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () {},
                                child: const Text('Dismiss'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Filter Chips
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _FilterChip(
                            label: 'All',
                            isSelected: taskProvider.selectedFilter == 'all',
                            onTap: () => taskProvider.setFilter('all'),
                          ),
                          const SizedBox(width: 8),
                          _FilterChip(
                            label: 'Today',
                            isSelected: taskProvider.selectedFilter == 'today',
                            onTap: () => taskProvider.setFilter('today'),
                          ),
                          const SizedBox(width: 8),
                          _FilterChip(
                            label: 'Upcoming',
                            isSelected: taskProvider.selectedFilter == 'upcoming',
                            onTap: () => taskProvider.setFilter('upcoming'),
                          ),
                          const SizedBox(width: 8),
                          _FilterChip(
                            label: 'Completed',
                            isSelected: taskProvider.selectedFilter == 'completed',
                            onTap: () => taskProvider.setFilter('completed'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 16)),

                // Tasks List
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final tasks = taskProvider.filteredTasks;
                      if (index >= tasks.length) return null;
                      
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: TaskCard(
                          task: tasks[index],
                          onToggle: () => taskProvider.toggleTaskStatus(tasks[index].id),
                          onTap: () {
                            // TODO: Open task details
                          },
                        ),
                      );
                    },
                    childCount: taskProvider.filteredTasks.length,
                  ),
                ),

                // Empty state
                if (taskProvider.filteredTasks.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 64,
                            color: AppTheme.textMuted.withValues(alpha: 0.3),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No tasks found',
                            style: TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.textPrimary : AppTheme.backgroundCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.textPrimary : AppTheme.surfaceLight,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? AppTheme.backgroundDark : AppTheme.textSecondary,
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
