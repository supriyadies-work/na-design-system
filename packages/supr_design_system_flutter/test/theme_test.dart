import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:supr_design_system_flutter/supr_design_system_flutter.dart';

double _channelLin(double s) {
  return s <= 0.03928
      ? s / 12.92
      : math.pow((s + 0.055) / 1.055, 2.4).toDouble();
}

double _luminance(Color c) {
  return 0.2126 * _channelLin(c.r) +
      0.7152 * _channelLin(c.g) +
      0.0722 * _channelLin(c.b);
}

double contrastRatio(Color fg, Color bg) {
  final l1 = _luminance(fg);
  final l2 = _luminance(bg);
  final lighter = math.max(l1, l2);
  final darker = math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

void main() {
  test('SuprCircleTheme.light attaches all extensions', () {
    final theme = SuprCircleTheme.light();
    expect(theme.extension<SuprColors>(), isNotNull);
    expect(theme.extension<SuprSpacing>(), isNotNull);
    expect(theme.extension<SuprRadii>(), isNotNull);
    expect(theme.extension<SuprShapes>(), isNotNull);
    expect(theme.extension<SuprTypography>(), isNotNull);
    expect(theme.extension<SuprMotion>(), isNotNull);
    expect(theme.brightness, Brightness.light);
  });

  test('WCAG AA contrast for semantic pairs', () {
    final c = SuprColors.light();
    expect(contrastRatio(c.contentPrimary, c.surfaceCanvas),
        greaterThanOrEqualTo(4.5));
    expect(contrastRatio(c.contentPrimary, c.surfaceCard),
        greaterThanOrEqualTo(4.5));
    expect(contrastRatio(c.contentSecondary, c.surfaceCard),
        greaterThanOrEqualTo(4.5));
    expect(
      contrastRatio(c.actionPrimaryForeground, c.actionPrimaryBackground),
      greaterThanOrEqualTo(4.5),
    );
    expect(
      contrastRatio(c.actionPrimaryOnContainer, c.actionPrimaryContainer),
      greaterThanOrEqualTo(4.5),
    );
    expect(
      contrastRatio(c.feedbackSuccessForeground, c.feedbackSuccessContainer),
      greaterThanOrEqualTo(4.5),
    );
    expect(
      contrastRatio(
          c.feedbackAttentionForeground, c.feedbackAttentionContainer),
      greaterThanOrEqualTo(4.5),
    );
    expect(
      contrastRatio(c.actionSecondaryForeground, c.actionSecondaryBackground),
      greaterThanOrEqualTo(3.0),
    );
  });

  test('motion ordering short < medium < long', () {
    final m = SuprMotion.light();
    expect(m.short.inMilliseconds, lessThan(m.medium.inMilliseconds));
    expect(m.medium.inMilliseconds, lessThan(m.long.inMilliseconds));
  });

  testWidgets('reduced motion resolves to zero', (tester) async {
    final motion = SuprMotion.light();
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(disableAnimations: true),
        child: Builder(
          builder: (context) {
            expect(motion.resolve(context, motion.medium), Duration.zero);
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  });

  test('copyWith and lerp cover colors', () {
    final a = SuprColors.light();
    final b = a.copyWith(contentPrimary: const Color(0xFF000000));
    expect(b.contentPrimary, const Color(0xFF000000));
    final mid = a.lerp(b, 0.5);
    expect(mid.contentPrimary, isNot(equals(a.contentPrimary)));
  });

  test('spacing copyWith and lerp', () {
    final a = SuprSpacing.light();
    final b = a.copyWith(gap: 99);
    expect(b.gap, 99);
    final mid = a.lerp(b, 0.5);
    expect(mid.gap, closeTo((a.gap + 99) / 2, 0.01));
  });

  test('fonts exist and are declared without google_fonts', () {
    final dir = Directory('assets/fonts');
    expect(dir.existsSync(), isTrue);
    for (final name in [
      'Lato-Light.ttf',
      'Lato-Regular.ttf',
      'Lato-Italic.ttf',
      'Lato-Bold.ttf',
      'Lato-Black.ttf',
      'OFL.txt',
    ]) {
      final f = File('assets/fonts/$name');
      expect(f.existsSync(), isTrue, reason: name);
      expect(f.lengthSync(), greaterThan(0));
    }
    final pubspec = File('pubspec.yaml').readAsStringSync();
    expect(pubspec.contains('google_fonts'), isFalse);
    expect(pubspec.contains('Lato-Regular.ttf'), isTrue);
  });

  testWidgets('semantic demo: CTA, card, chip, nav', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: SuprCircleTheme.light(),
        themeMode: ThemeMode.light,
        home: Builder(
          builder: (context) {
            final colors = SuprColors.of(context);
            final spacing = SuprSpacing.of(context);
            final typography = SuprTypography.of(context);
            final shapes = SuprShapes.of(context);
            return Scaffold(
              body: Padding(
                padding: EdgeInsets.all(spacing.pagePaddingX),
                child: Column(
                  children: [
                    Text('Title', style: typography.titleLarge),
                    Container(
                      decoration: ShapeDecoration(
                        color: colors.surfaceCard,
                        shape: shapes.card,
                        shadows: shapes.cardShadow,
                      ),
                      padding: EdgeInsets.all(spacing.cardPadding),
                      child: Text('Card', style: typography.bodyMedium),
                    ),
                    Container(
                      decoration: ShapeDecoration(
                        color: colors.actionPrimaryContainer,
                        shape: shapes.chip,
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      child: Text(
                        'MEMBER AKTIF',
                        style: typography.labelLarge
                            .copyWith(color: colors.actionPrimaryOnContainer),
                      ),
                    ),
                    FilledButton(
                      onPressed: () {},
                      child: Text(
                        'Edit Profil',
                        style: typography.labelLarge
                            .copyWith(color: colors.actionPrimaryForeground),
                      ),
                    ),
                    Icon(Icons.person, color: colors.navigationActive),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
    expect(find.text('Edit Profil'), findsOneWidget);
    expect(find.text('MEMBER AKTIF'), findsOneWidget);
    expect(find.text('Card'), findsOneWidget);
  });
}
