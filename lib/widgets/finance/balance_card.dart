import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../providers/finance_provider.dart';
import '../../models/transaction.dart';
import '../common/gradient_card.dart';
import 'finance_charts.dart';
import 'package:intl/intl.dart';

class BalanceCard extends StatelessWidget {
  const BalanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, provider, _) {
        final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
        final percentChange = provider.totalIncome > 0 
            ? ((provider.monthlyIncome - provider.monthlyExpense) / provider.totalIncome * 100)
            : 0.0;
        
        return GradientCard(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Balance',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: percentChange >= 0 
                          ? AppTheme.success.withValues(alpha: 0.2)
                          : AppTheme.error.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${percentChange >= 0 ? '+' : ''}${percentChange.toStringAsFixed(1)}%',
                      style: TextStyle(
                        color: percentChange >= 0 ? AppTheme.success : AppTheme.error,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                currencyFormat.format(provider.totalBalance),
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              // Mini Chart
              MiniBarChart(
                data: provider.getWeeklyData(provider.totalIncome > provider.totalExpense 
                    ? TransactionType.income 
                    : TransactionType.expense),
                barColor: AppTheme.primaryPurple.withValues(alpha: 0.7),
              ),
              const SizedBox(height: 16),
              // Income/Expense Summary
              Row(
                children: [
                  Expanded(
                    child: _SummaryItem(
                      label: 'MONTHLY INCOME',
                      amount: provider.monthlyIncome,
                      color: AppTheme.success,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _SummaryItem(
                      label: 'MONTHLY SPENT',
                      amount: provider.monthlyExpense,
                      color: AppTheme.error,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final double amount;
  final Color color;

  const _SummaryItem({
    required this.label,
    required this.amount,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textMuted,
            fontSize: 10,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          currencyFormat.format(amount),
          style: TextStyle(
            color: color,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
