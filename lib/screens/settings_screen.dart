import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Settings',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Profile Section
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.backgroundCard,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: AppTheme.primaryPurple,
                            child: const Text(
                              'S',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Sarah Johnson',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'sarah.johnson@email.com',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: AppTheme.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right,
                            color: AppTheme.textMuted,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Settings Groups
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _SectionTitle('PREFERENCES'),
                    _SettingsGroup(
                      items: [
                        _SettingsItem(
                          icon: Icons.notifications_outlined,
                          title: 'Notifications',
                          trailing: const _ToggleSwitch(value: true),
                        ),
                        _SettingsItem(
                          icon: Icons.dark_mode_outlined,
                          title: 'Dark Mode',
                          trailing: const _ToggleSwitch(value: true),
                        ),
                        _SettingsItem(
                          icon: Icons.language_outlined,
                          title: 'Language',
                          subtitle: 'English',
                        ),
                        _SettingsItem(
                          icon: Icons.attach_money,
                          title: 'Currency',
                          subtitle: 'USD (\$)',
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const _SectionTitle('FINANCE'),
                    _SettingsGroup(
                      items: [
                        _SettingsItem(
                          icon: Icons.account_balance_outlined,
                          title: 'Bank Accounts',
                          subtitle: '2 connected',
                        ),
                        _SettingsItem(
                          icon: Icons.category_outlined,
                          title: 'Categories',
                        ),
                        _SettingsItem(
                          icon: Icons.repeat_outlined,
                          title: 'Recurring Transactions',
                        ),
                        _SettingsItem(
                          icon: Icons.pie_chart_outline,
                          title: 'Budgets',
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const _SectionTitle('DATA'),
                    _SettingsGroup(
                      items: [
                        _SettingsItem(
                          icon: Icons.cloud_upload_outlined,
                          title: 'Backup & Sync',
                          subtitle: 'Last synced 2 hours ago',
                        ),
                        _SettingsItem(
                          icon: Icons.file_download_outlined,
                          title: 'Export Data',
                        ),
                        _SettingsItem(
                          icon: Icons.delete_outline,
                          title: 'Clear All Data',
                          titleColor: AppTheme.error,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const _SectionTitle('ABOUT'),
                    _SettingsGroup(
                      items: [
                        _SettingsItem(
                          icon: Icons.help_outline,
                          title: 'Help & Support',
                        ),
                        _SettingsItem(
                          icon: Icons.privacy_tip_outlined,
                          title: 'Privacy Policy',
                        ),
                        _SettingsItem(
                          icon: Icons.info_outline,
                          title: 'About',
                          subtitle: 'Version 1.0.0',
                        ),
                      ],
                    ),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppTheme.textMuted,
          letterSpacing: 1,
        ),
      ),
    );
  }
}

class _SettingsGroup extends StatelessWidget {
  final List<_SettingsItem> items;

  const _SettingsGroup({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.backgroundCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return Column(
            children: [
              item,
              if (index < items.length - 1)
                Divider(
                  height: 1,
                  color: AppTheme.surfaceLight.withValues(alpha: 0.5),
                  indent: 56,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final Color? titleColor;

  const _SettingsItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.titleColor,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: AppTheme.textSecondary, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: titleColor ?? AppTheme.textPrimary,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              trailing ??
                  const Icon(
                    Icons.chevron_right,
                    color: AppTheme.textMuted,
                    size: 20,
                  ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToggleSwitch extends StatelessWidget {
  final bool value;

  const _ToggleSwitch({required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 28,
      decoration: BoxDecoration(
        color: value ? AppTheme.primaryPurple : AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(14),
      ),
      child: AnimatedAlign(
        duration: const Duration(milliseconds: 200),
        alignment: value ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          width: 24,
          height: 24,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
