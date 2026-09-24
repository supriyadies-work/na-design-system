import 'package:flutter/material.dart';
import 'package:supr_design_system_flutter/supr_design_system_flutter.dart';

/// Minimal example — semantic tokens only.
void main() {
  runApp(const SuprCircleExampleApp());
}

class SuprCircleExampleApp extends StatelessWidget {
  const SuprCircleExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SuprCircle DS Example',
      theme: SuprCircleTheme.light(),
      themeMode: ThemeMode.light,
      themeAnimationStyle: AnimationStyle.noAnimation,
      home: const _Home(),
    );
  }
}

class _Home extends StatelessWidget {
  const _Home();

  @override
  Widget build(BuildContext context) {
    final colors = SuprColors.of(context);
    final spacing = SuprSpacing.of(context);
    final typography = SuprTypography.of(context);
    final shapes = SuprShapes.of(context);

    return Scaffold(
      appBar: AppBar(title: Text('SuprCircle', style: typography.titleMedium)),
      body: ListView(
        padding: EdgeInsets.all(spacing.pagePaddingX),
        children: [
          Text('Profile', style: typography.headlineMedium),
          SizedBox(height: spacing.gap),
          Container(
            decoration: ShapeDecoration(
              color: colors.surfaceCard,
              shape: shapes.card,
              shadows: shapes.cardShadow,
            ),
            padding: EdgeInsets.all(spacing.cardPadding),
            child: Text(
              'Semantic card surface',
              style: typography.bodyMedium
                  .copyWith(color: colors.contentSecondary),
            ),
          ),
          SizedBox(height: spacing.sectionGap),
          FilledButton(
            onPressed: () {},
            child: const Text('Primary CTA'),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 4,
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.home_outlined), label: 'Beranda'),
          NavigationDestination(
              icon: Icon(Icons.calendar_today_outlined), label: 'Jadwal'),
          NavigationDestination(
              icon: Icon(Icons.bolt_outlined), label: 'Aktivitas'),
          NavigationDestination(
              icon: Icon(Icons.card_giftcard_outlined), label: 'Benefit'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }
}
