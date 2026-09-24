import 'package:flutter/material.dart';

import '../generated/supr_circle_tokens.g.dart';

/// Semantic spacing roles for SuprCircle layouts.
@immutable
class SuprSpacing extends ThemeExtension<SuprSpacing> {
  const SuprSpacing({
    required this.pagePaddingX,
    required this.pagePaddingXCompact,
    required this.cardPadding,
    required this.gap,
    required this.sectionGap,
    required this.headerHeight,
    required this.bottomNavHeight,
    required this.ctaHeight,
    required this.minTouchTarget,
  });

  factory SuprSpacing.light() => const SuprSpacing(
        pagePaddingX: SuprCircleTokens.suprcircle_component_page_paddingX,
        pagePaddingXCompact: SuprCircleTokens.suprcircle_dimension_space_13,
        cardPadding: SuprCircleTokens.suprcircle_component_card_padding,
        gap: SuprCircleTokens.suprcircle_component_page_gap,
        sectionGap: SuprCircleTokens.suprcircle_component_page_sectionGap,
        headerHeight: SuprCircleTokens.suprcircle_component_header_height,
        bottomNavHeight: SuprCircleTokens.suprcircle_component_bottomNav_height,
        ctaHeight: SuprCircleTokens.suprcircle_component_cta_height,
        minTouchTarget: SuprCircleTokens.suprcircle_component_touch_minTarget,
      );

  final double pagePaddingX;
  final double pagePaddingXCompact;
  final double cardPadding;
  final double gap;
  final double sectionGap;
  final double headerHeight;
  final double bottomNavHeight;
  final double ctaHeight;
  final double minTouchTarget;

  static SuprSpacing of(BuildContext context) {
    final value = Theme.of(context).extension<SuprSpacing>();
    assert(value != null,
        'SuprSpacing missing — wrap with SuprCircleTheme.light()');
    return value!;
  }

  @override
  SuprSpacing copyWith({
    double? pagePaddingX,
    double? pagePaddingXCompact,
    double? cardPadding,
    double? gap,
    double? sectionGap,
    double? headerHeight,
    double? bottomNavHeight,
    double? ctaHeight,
    double? minTouchTarget,
  }) {
    return SuprSpacing(
      pagePaddingX: pagePaddingX ?? this.pagePaddingX,
      pagePaddingXCompact: pagePaddingXCompact ?? this.pagePaddingXCompact,
      cardPadding: cardPadding ?? this.cardPadding,
      gap: gap ?? this.gap,
      sectionGap: sectionGap ?? this.sectionGap,
      headerHeight: headerHeight ?? this.headerHeight,
      bottomNavHeight: bottomNavHeight ?? this.bottomNavHeight,
      ctaHeight: ctaHeight ?? this.ctaHeight,
      minTouchTarget: minTouchTarget ?? this.minTouchTarget,
    );
  }

  @override
  SuprSpacing lerp(ThemeExtension<SuprSpacing>? other, double t) {
    if (other is! SuprSpacing) return this;
    double l(double a, double b) => a + (b - a) * t;
    return SuprSpacing(
      pagePaddingX: l(pagePaddingX, other.pagePaddingX),
      pagePaddingXCompact: l(pagePaddingXCompact, other.pagePaddingXCompact),
      cardPadding: l(cardPadding, other.cardPadding),
      gap: l(gap, other.gap),
      sectionGap: l(sectionGap, other.sectionGap),
      headerHeight: l(headerHeight, other.headerHeight),
      bottomNavHeight: l(bottomNavHeight, other.bottomNavHeight),
      ctaHeight: l(ctaHeight, other.ctaHeight),
      minTouchTarget: l(minTouchTarget, other.minTouchTarget),
    );
  }
}
