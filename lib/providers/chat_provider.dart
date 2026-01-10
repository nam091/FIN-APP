import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';

class ChatProvider with ChangeNotifier {
  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _error;

  // Configure your AI API endpoint here
  final String _apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  final String _apiKey = ''; // Add your API key here

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  final List<String> suggestedPrompts = [
    "How much did I spend on dining this week?",
    "What's my budget status?",
    "Show me my spending trends",
    "Help me create a savings plan",
    "Summarize my finances this month",
  ];

  void clearMessages() {
    _messages.clear();
    notifyListeners();
  }

  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    // Add user message
    final userMessage = ChatMessage(
      content: content,
      role: MessageRole.user,
    );
    _messages.add(userMessage);
    _error = null;
    notifyListeners();

    // Add loading message
    final loadingMessage = ChatMessage(
      content: '',
      role: MessageRole.assistant,
      isLoading: true,
    );
    _messages.add(loadingMessage);
    _isLoading = true;
    notifyListeners();

    try {
      String response;
      
      if (_apiKey.isEmpty) {
        // Demo mode - simulate AI response
        await Future.delayed(const Duration(seconds: 1));
        response = _getDemoResponse(content);
      } else {
        // Real API call
        response = await _callAI(content);
      }

      // Replace loading message with actual response
      _messages.removeLast();
      _messages.add(ChatMessage(
        content: response,
        role: MessageRole.assistant,
      ));
    } catch (e) {
      _messages.removeLast();
      _error = e.toString();
      _messages.add(ChatMessage(
        content: 'Sorry, I encountered an error. Please try again.',
        role: MessageRole.assistant,
      ));
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<String> _callAI(String userMessage) async {
    final response = await http.post(
      Uri.parse(_apiEndpoint),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_apiKey',
      },
      body: json.encode({
        'model': 'gpt-3.5-turbo',
        'messages': [
          {
            'role': 'system',
            'content': 'You are a helpful financial assistant. Help users track their spending, create budgets, and provide financial advice. Be concise and practical.',
          },
          ..._messages.where((m) => !m.isLoading).map((m) => {
            'role': m.role == MessageRole.user ? 'user' : 'assistant',
            'content': m.content,
          }),
          {'role': 'user', 'content': userMessage},
        ],
        'max_tokens': 500,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['choices'][0]['message']['content'];
    } else {
      throw Exception('API Error: ${response.statusCode}');
    }
  }

  String _getDemoResponse(String userMessage) {
    final lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.contains('spend') && lowerMessage.contains('dining')) {
      return "Based on your transactions this week, you've spent approximately \$45.50 on dining. This includes:\n\n• Burger King - \$12.50\n• Coffee Shop - \$8.00\n• Pizza Delivery - \$25.00\n\nThis is about 15% higher than your weekly average. Would you like me to help you set a dining budget?";
    }

    if (lowerMessage.contains('budget')) {
      return "Here's your budget overview:\n\n📊 **Monthly Budget: \$3,000**\n✅ Spent: \$1,250 (42%)\n💰 Remaining: \$1,750\n\n**Category Breakdown:**\n• Food & Dining: \$320 / \$400\n• Transportation: \$150 / \$200\n• Entertainment: \$80 / \$150\n• Shopping: \$200 / \$300\n\nYou're on track this month! 🎉";
    }

    if (lowerMessage.contains('trend') || lowerMessage.contains('spending')) {
      return "📈 **Spending Trends (Last 3 Months)**\n\n**October:** \$2,450\n**November:** \$2,680 (+9%)\n**December:** \$2,350 (-12%)\n\nGreat news! Your spending decreased in December. The main categories that improved:\n\n• Shopping: ↓ 25%\n• Entertainment: ↓ 15%\n\nKeep up the good work! 💪";
    }

    if (lowerMessage.contains('saving') || lowerMessage.contains('save')) {
      return "Here's a savings plan tailored for you:\n\n🎯 **Goal: Save \$5,000 in 6 months**\n\n**Monthly Target:** \$833\n\n**Suggested Actions:**\n1. Reduce dining out by 20% → Save \$80/month\n2. Cancel unused subscriptions → Save \$30/month\n3. Use public transport twice a week → Save \$50/month\n4. 50/30/20 rule for new income\n\nWould you like me to set up automatic savings reminders?";
    }

    if (lowerMessage.contains('summarize') || lowerMessage.contains('summary')) {
      return "📋 **Monthly Finance Summary**\n\n💵 **Income:** \$6,050\n• Salary: \$5,200\n• Freelance: \$850\n\n💸 **Expenses:** \$2,350\n• Bills: \$650\n• Food: \$420\n• Transport: \$180\n• Entertainment: \$280\n• Shopping: \$320\n• Other: \$500\n\n💰 **Net Savings:** \$3,700 (61%)\n\nExcellent job! You're saving more than the recommended 20%. 🌟";
    }

    return "I'm your AI financial assistant! I can help you with:\n\n• 📊 Tracking spending and budgets\n• 📈 Analyzing financial trends\n• 💰 Creating savings plans\n• 📝 Summarizing your finances\n\nTry asking me something like:\n• \"How much did I spend on dining?\"\n• \"What's my budget status?\"\n• \"Help me create a savings plan\"";
  }
}
