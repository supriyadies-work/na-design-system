import 'package:flutter/material.dart';

import '../generated/supr_circle_tokens.g.dart';

/// Semantic corner radii.
@immutable
class SuprRadii extends ThemeExtension<SuprRadii> {
  const SuprRadii({
    required this.card,
    required this.memberCard,
    required this.chip,
    required this.cta,
    required this.full,
  });

  factory SuprRadii.light() => const SuprRadii(
        card: SuprCircleTokens.suprcircle_component_card_radius,
        memberCard: SuprCircleTokens.suprcircle_component_memberCard_radius,
        chip: SuprCircleTokens.suprcircle_component_chip_radius,
        cta: SuprCircleTokens.suprcircle_component_cta_radius,
        full: SuprCircleTokens.suprcircle_dimension_radius_full,
      );

  final double card;
  final double memberCard;
  final double chip;
  final double cta;
  final double full;

  static SuprRadii of(BuildContext context) {
    final value = Theme.of(context).extension<SuprRadii>();
    assert(
        value != null, 'SuprRadii missing — wrap with SuprCircleTheme.light()');
    return value!;
  }

  @override
  SuprRadii copyWith({
    double? card,
    double? memberCard,
    double? chip,
    double? cta,
    double? full,
  }) {
    return SuprRadii(
      card: card ?? this.card,
      memberCard: memberCard ?? this.memberCard,
      chip: chip ?? this.chip,
      cta: cta ?? this.cta,
      full: full ?? this.full,
    );
  }

  @override
  SuprRadii lerp(ThemeExtension<SuprRadii>? other, double t) {
    if (other is! SuprRadii) return this;
    double l(double a, double b) => a + (b - a) * t;
    return SuprRadii(
      card: l(card, other.card),
      memberCard: l(memberCard, other.memberCard),
      chip: l(chip, other.chip),
      cta: l(cta, other.cta),
      full: l(full, other.full),
    );
  }
}
