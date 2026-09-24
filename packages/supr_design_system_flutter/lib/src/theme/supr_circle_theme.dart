import 'package:flutter/material.dart';

import 'supr_colors.dart';
import 'supr_motion.dart';
import 'supr_radii.dart';
import 'supr_shapes.dart';
import 'supr_spacing.dart';
import 'supr_typography.dart';

/// Hand-authored SuprCircle light theme.
///
/// Dark mode is **not designed** yet — do not invent an inverted palette.
/// Structure allows a future `SuprCircleTheme.dark()` without breaking consumers.
abstract final class SuprCircleTheme {
  /// Light ThemeData with all SuprCircle extensions attached exactly once.
  static ThemeData light() {
    final colors = SuprColors.light();
    final spacing = SuprSpacing.light();
    final radii = SuprRadii.light();
    final typography = SuprTypography.light(color: colors.contentPrimary);
    final motion = SuprMotion.light();
    final shapes = SuprShapes.light(radii, colors);

    // Hand-authored ColorScheme — never ColorScheme.fromSeed / dynamic_color.
    final colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: colors.actionPrimaryBackground,
      onPrimary: colors.actionPrimaryForeground,
      primaryContainer: colors.actionPrimaryContainer,
      onPrimaryContainer: colors.actionPrimaryOnContainer,
      secondary: colors.actionSecondaryBackground,
      onSecondary: colors.actionSecondaryForeground,
      secondaryContainer: colors.feedbackAttentionContainer,
      onSecondaryContainer: colors.feedbackAttentionForeground,
      tertiary: colors.feedbackInfoContainer,
      onTertiary: colors.feedbackInfoForeground,
      tertiaryContainer: colors.surfaceSubtle,
      onTertiaryContainer: colors.contentPrimary,
      error: colors.feedbackAttentionForeground,
      onError: colors.contentOnPrimary,
      errorContainer: colors.feedbackAttentionContainer,
      onErrorContainer: colors.feedbackAttentionForeground,
      surface: colors.surfaceCard,
      onSurface: colors.contentPrimary,
      surfaceContainerHighest: colors.surfaceSubtle,
      surfaceContainerHigh: colors.surfaceHeader,
      surfaceContainer: colors.surfaceCanvas,
      surfaceContainerLow: colors.surfaceHeader,
      surfaceContainerLowest: colors.surfaceCard,
      onSurfaceVariant: colors.contentSecondary,
      outline: colors.outlineDefault,
      outlineVariant: colors.outlineSubtle,
      shadow: colors.shadowCard,
      scrim: colors.contentPrimary.withValues(alpha: 0.32),
      inverseSurface: colors.contentPrimary,
      onInverseSurface: colors.contentOnPrimary,
      inversePrimary: colors.actionPrimaryContainer,
    );

    final textTheme = TextTheme(
      displayLarge: typography.display,
      displayMedium: typography.headlineLarge,
      displaySmall: typography.headlineMedium,
      headlineLarge: typography.headlineLarge,
      headlineMedium: typography.headlineMedium,
      headlineSmall: typography.titleLarge,
      titleLarge: typography.titleLarge,
      titleMedium: typography.titleMedium,
      titleSmall: typography.titleSmall,
      bodyLarge: typography.bodyLarge,
      bodyMedium: typography.bodyMedium,
      bodySmall: typography.bodySmall,
      labelLarge: typography.labelLarge,
      labelMedium: typography.labelMedium,
      labelSmall: typography.labelSmall,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: colors.surfaceCanvas,
      canvasColor: colors.surfaceCanvas,
      fontFamily: typography.bodyLarge.fontFamily,
      textTheme: textTheme,
      primaryTextTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: colors.surfaceHeader,
        foregroundColor: colors.contentPrimary,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: typography.titleMedium,
      ),
      cardTheme: CardThemeData(
        color: colors.surfaceCard,
        elevation: 0,
        shape: shapes.card,
        margin: EdgeInsets.zero,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: colors.actionPrimaryBackground,
          foregroundColor: colors.actionPrimaryForeground,
          minimumSize: Size(spacing.minTouchTarget, spacing.ctaHeight),
          shape: shapes.cta,
          textStyle: typography.labelLarge,
        ),
      ),
      extensions: <ThemeExtension<dynamic>>[
        colors,
        spacing,
        radii,
        shapes,
        typography,
        motion,
      ],
    );
  }
}
