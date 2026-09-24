import 'package:flutter/material.dart';

import '../generated/supr_circle_tokens.g.dart';
import 'supr_colors.dart';
import 'supr_radii.dart';

/// Shape / elevation helpers derived from semantic tokens.
@immutable
class SuprShapes extends ThemeExtension<SuprShapes> {
  const SuprShapes({
    required this.card,
    required this.memberCard,
    required this.chip,
    required this.cta,
    required this.cardShadow,
    required this.cardSubtleShadow,
    required this.bottomNavShadow,
    required this.stickyActionShadow,
  });

  factory SuprShapes.light(SuprRadii radii, SuprColors colors) {
    return SuprShapes(
      card: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radii.card)),
      memberCard: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radii.memberCard)),
      chip: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radii.chip)),
      cta: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radii.cta)),
      cardShadow: [
        BoxShadow(
          color: colors.shadowCard,
          offset: const Offset(0, 1),
          blurRadius: 3,
          spreadRadius: 0,
        ),
      ],
      cardSubtleShadow: const [
        BoxShadow(
          color: SuprCircleTokens.suprcircle_color_primitive_neutral_edf0f4,
          offset: Offset(0, 1),
          blurRadius: 1,
          spreadRadius: 0,
        ),
      ],
      bottomNavShadow: [
        BoxShadow(
          color: colors.shadowNav,
          offset: const Offset(0, -3),
          blurRadius: 6,
          spreadRadius: 0,
        ),
      ],
      stickyActionShadow: [
        BoxShadow(
          color: colors.shadowNav,
          offset: const Offset(0, -3),
          blurRadius: 12,
          spreadRadius: 0,
        ),
      ],
    );
  }

  final RoundedRectangleBorder card;
  final RoundedRectangleBorder memberCard;
  final RoundedRectangleBorder chip;
  final RoundedRectangleBorder cta;
  final List<BoxShadow> cardShadow;
  final List<BoxShadow> cardSubtleShadow;
  final List<BoxShadow> bottomNavShadow;
  final List<BoxShadow> stickyActionShadow;

  static SuprShapes of(BuildContext context) {
    final value = Theme.of(context).extension<SuprShapes>();
    assert(value != null,
        'SuprShapes missing — wrap with SuprCircleTheme.light()');
    return value!;
  }

  @override
  SuprShapes copyWith({
    RoundedRectangleBorder? card,
    RoundedRectangleBorder? memberCard,
    RoundedRectangleBorder? chip,
    RoundedRectangleBorder? cta,
    List<BoxShadow>? cardShadow,
    List<BoxShadow>? cardSubtleShadow,
    List<BoxShadow>? bottomNavShadow,
    List<BoxShadow>? stickyActionShadow,
  }) {
    return SuprShapes(
      card: card ?? this.card,
      memberCard: memberCard ?? this.memberCard,
      chip: chip ?? this.chip,
      cta: cta ?? this.cta,
      cardShadow: cardShadow ?? this.cardShadow,
      cardSubtleShadow: cardSubtleShadow ?? this.cardSubtleShadow,
      bottomNavShadow: bottomNavShadow ?? this.bottomNavShadow,
      stickyActionShadow: stickyActionShadow ?? this.stickyActionShadow,
    );
  }

  @override
  SuprShapes lerp(ThemeExtension<SuprShapes>? other, double t) {
    if (other is! SuprShapes) return this;
    // Non-interpolable shape borders snap at midpoint.
    final snap = t < 0.5;
    return SuprShapes(
      card: snap ? card : other.card,
      memberCard: snap ? memberCard : other.memberCard,
      chip: snap ? chip : other.chip,
      cta: snap ? cta : other.cta,
      cardShadow:
          BoxShadow.lerpList(cardShadow, other.cardShadow, t) ?? cardShadow,
      cardSubtleShadow:
          BoxShadow.lerpList(cardSubtleShadow, other.cardSubtleShadow, t) ??
              cardSubtleShadow,
      bottomNavShadow:
          BoxShadow.lerpList(bottomNavShadow, other.bottomNavShadow, t) ??
              bottomNavShadow,
      stickyActionShadow:
          BoxShadow.lerpList(stickyActionShadow, other.stickyActionShadow, t) ??
              stickyActionShadow,
    );
  }
}
