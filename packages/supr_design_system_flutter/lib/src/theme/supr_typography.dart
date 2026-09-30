import 'package:flutter/material.dart';

import '../generated/supr_circle_tokens.g.dart';

TextStyle _style({
  required double size,
  required double height,
  required FontWeight weight,
  Color? color,
  double letterSpacing = 0,
}) {
  return TextStyle(
    fontFamily: SuprCircleTokens.suprcircle_font_family_primary,
    fontFamilyFallback: const [
      'system-ui',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    fontSize: size,
    height: height / size,
    fontWeight: weight,
    letterSpacing: letterSpacing,
    color: color,
    fontFeatures: const [FontFeature.tabularFigures()],
  );
}

/// Semantic type scale for the named SuprCircle frames. Feature widgets do not invent sizes.
@immutable
class SuprTypography extends ThemeExtension<SuprTypography> {
  const SuprTypography({
    required this.display,
    required this.headlineLarge,
    required this.headlineMedium,
    required this.titleLarge,
    required this.titleMedium,
    required this.titleSmall,
    required this.bodyLarge,
    required this.bodyMedium,
    required this.bodySmall,
    required this.labelLarge,
    required this.labelMedium,
    required this.labelMediumEmphasized,
    required this.labelSmall,
    required this.labelMicro,
    required this.sectionTitle,
    required this.sessionTitle,
  });

  factory SuprTypography.light({Color? color}) {
    final c = color ?? SuprCircleTokens.suprcircle_color_content_primary;
    return SuprTypography(
      display: _style(
        size: SuprCircleTokens.suprcircle_typography_display_fontSize,
        height: SuprCircleTokens.suprcircle_typography_display_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_display_fontWeight,
        color: c,
      ),
      headlineLarge: _style(
        size: SuprCircleTokens.suprcircle_typography_headlineLarge_fontSize,
        height: SuprCircleTokens.suprcircle_typography_headlineLarge_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_headlineLarge_fontWeight,
        color: c,
      ),
      headlineMedium: _style(
        size: SuprCircleTokens.suprcircle_typography_headlineMedium_fontSize,
        height:
            SuprCircleTokens.suprcircle_typography_headlineMedium_lineHeight,
        weight:
            SuprCircleTokens.suprcircle_typography_headlineMedium_fontWeight,
        color: c,
      ),
      titleLarge: _style(
        size: SuprCircleTokens.suprcircle_typography_titleLarge_fontSize,
        height: SuprCircleTokens.suprcircle_typography_titleLarge_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_titleLarge_fontWeight,
        color: c,
      ),
      titleMedium: _style(
        size: SuprCircleTokens.suprcircle_typography_titleMedium_fontSize,
        height: SuprCircleTokens.suprcircle_typography_titleMedium_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_titleMedium_fontWeight,
        color: c,
      ),
      titleSmall: _style(
        size: SuprCircleTokens.suprcircle_typography_titleSmall_fontSize,
        height: SuprCircleTokens.suprcircle_typography_titleSmall_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_titleSmall_fontWeight,
        color: c,
      ),
      bodyLarge: _style(
        size: SuprCircleTokens.suprcircle_typography_bodyLarge_fontSize,
        height: SuprCircleTokens.suprcircle_typography_bodyLarge_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_bodyLarge_fontWeight,
        color: c,
      ),
      bodyMedium: _style(
        size: SuprCircleTokens.suprcircle_typography_bodyMedium_fontSize,
        height: SuprCircleTokens.suprcircle_typography_bodyMedium_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_bodyMedium_fontWeight,
        color: c,
      ),
      bodySmall: _style(
        size: SuprCircleTokens.suprcircle_typography_bodySmall_fontSize,
        height: SuprCircleTokens.suprcircle_typography_bodySmall_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_bodySmall_fontWeight,
        color: c,
      ),
      labelLarge: _style(
        size: SuprCircleTokens.suprcircle_typography_labelLarge_fontSize,
        height: SuprCircleTokens.suprcircle_typography_labelLarge_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_labelLarge_fontWeight,
        color: c,
      ),
      labelMedium: _style(
        size: SuprCircleTokens.suprcircle_typography_labelMedium_fontSize,
        height: SuprCircleTokens.suprcircle_typography_labelMedium_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_labelMedium_fontWeight,
        color: c,
      ),
      labelMediumEmphasized: _style(
        size: SuprCircleTokens.suprcircle_typography_labelMedium_fontSize,
        height: SuprCircleTokens.suprcircle_typography_labelMedium_lineHeight,
        weight: FontWeight.w700,
        color: c,
      ),
      labelSmall: _style(
        size: SuprCircleTokens.suprcircle_typography_labelSmall_fontSize,
        height: SuprCircleTokens.suprcircle_typography_labelSmall_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_labelSmall_fontWeight,
        color: c,
      ),
      labelMicro: _style(
        size: SuprCircleTokens.suprcircle_typography_labelMicro_fontSize,
        height: SuprCircleTokens.suprcircle_typography_labelMicro_lineHeight,
        weight: SuprCircleTokens.suprcircle_typography_labelMicro_fontWeight,
        color: c,
      ),
      sectionTitle: _style(
        size: 15,
        height: 18,
        weight: FontWeight.w500,
        color: c,
      ),
      sessionTitle: _style(
        size: 22,
        height: 26.4,
        weight: FontWeight.w700,
        letterSpacing: -0.6,
        color: c,
      ),
    );
  }

  final TextStyle display;
  final TextStyle headlineLarge;
  final TextStyle headlineMedium;
  final TextStyle titleLarge;
  final TextStyle titleMedium;
  final TextStyle titleSmall;
  final TextStyle bodyLarge;
  final TextStyle bodyMedium;
  final TextStyle bodySmall;
  final TextStyle labelLarge;
  final TextStyle labelMedium;
  final TextStyle labelMediumEmphasized;
  final TextStyle labelSmall;
  final TextStyle labelMicro;
  final TextStyle sectionTitle;
  final TextStyle sessionTitle;

  static SuprTypography of(BuildContext context) {
    final value = Theme.of(context).extension<SuprTypography>();
    assert(value != null,
        'SuprTypography missing — wrap with SuprCircleTheme.light()');
    return value!;
  }

  @override
  SuprTypography copyWith({
    TextStyle? display,
    TextStyle? headlineLarge,
    TextStyle? headlineMedium,
    TextStyle? titleLarge,
    TextStyle? titleMedium,
    TextStyle? titleSmall,
    TextStyle? bodyLarge,
    TextStyle? bodyMedium,
    TextStyle? bodySmall,
    TextStyle? labelLarge,
    TextStyle? labelMedium,
    TextStyle? labelMediumEmphasized,
    TextStyle? labelSmall,
    TextStyle? labelMicro,
    TextStyle? sectionTitle,
    TextStyle? sessionTitle,
  }) {
    return SuprTypography(
      display: display ?? this.display,
      headlineLarge: headlineLarge ?? this.headlineLarge,
      headlineMedium: headlineMedium ?? this.headlineMedium,
      titleLarge: titleLarge ?? this.titleLarge,
      titleMedium: titleMedium ?? this.titleMedium,
      titleSmall: titleSmall ?? this.titleSmall,
      bodyLarge: bodyLarge ?? this.bodyLarge,
      bodyMedium: bodyMedium ?? this.bodyMedium,
      bodySmall: bodySmall ?? this.bodySmall,
      labelLarge: labelLarge ?? this.labelLarge,
      labelMedium: labelMedium ?? this.labelMedium,
      labelMediumEmphasized:
          labelMediumEmphasized ?? this.labelMediumEmphasized,
      labelSmall: labelSmall ?? this.labelSmall,
      labelMicro: labelMicro ?? this.labelMicro,
      sectionTitle: sectionTitle ?? this.sectionTitle,
      sessionTitle: sessionTitle ?? this.sessionTitle,
    );
  }

  @override
  SuprTypography lerp(ThemeExtension<SuprTypography>? other, double t) {
    if (other is! SuprTypography) return this;
    return SuprTypography(
      display: TextStyle.lerp(display, other.display, t)!,
      headlineLarge: TextStyle.lerp(headlineLarge, other.headlineLarge, t)!,
      headlineMedium: TextStyle.lerp(headlineMedium, other.headlineMedium, t)!,
      titleLarge: TextStyle.lerp(titleLarge, other.titleLarge, t)!,
      titleMedium: TextStyle.lerp(titleMedium, other.titleMedium, t)!,
      titleSmall: TextStyle.lerp(titleSmall, other.titleSmall, t)!,
      bodyLarge: TextStyle.lerp(bodyLarge, other.bodyLarge, t)!,
      bodyMedium: TextStyle.lerp(bodyMedium, other.bodyMedium, t)!,
      bodySmall: TextStyle.lerp(bodySmall, other.bodySmall, t)!,
      labelLarge: TextStyle.lerp(labelLarge, other.labelLarge, t)!,
      labelMedium: TextStyle.lerp(labelMedium, other.labelMedium, t)!,
      labelMediumEmphasized: TextStyle.lerp(
          labelMediumEmphasized, other.labelMediumEmphasized, t)!,
      labelSmall: TextStyle.lerp(labelSmall, other.labelSmall, t)!,
      labelMicro: TextStyle.lerp(labelMicro, other.labelMicro, t)!,
      sectionTitle: TextStyle.lerp(sectionTitle, other.sectionTitle, t)!,
      sessionTitle: TextStyle.lerp(sessionTitle, other.sessionTitle, t)!,
    );
  }
}
