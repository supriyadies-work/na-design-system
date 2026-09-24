import 'package:flutter/material.dart';

import '../generated/supr_circle_tokens.g.dart';

/// Motion tokens with reduced-motion respect.
@immutable
class SuprMotion extends ThemeExtension<SuprMotion> {
  const SuprMotion({
    required this.instant,
    required this.short,
    required this.medium,
    required this.long,
    required this.standard,
    required this.enter,
    required this.exit,
  });

  factory SuprMotion.light() => const SuprMotion(
        instant: SuprCircleTokens.suprcircle_motion_duration_instant,
        short: SuprCircleTokens.suprcircle_motion_duration_short,
        medium: SuprCircleTokens.suprcircle_motion_duration_medium,
        long: SuprCircleTokens.suprcircle_motion_duration_long,
        standard: SuprCircleTokens.suprcircle_motion_curve_standard,
        enter: SuprCircleTokens.suprcircle_motion_curve_enter,
        exit: SuprCircleTokens.suprcircle_motion_curve_exit,
      );

  final Duration instant;
  final Duration short;
  final Duration medium;
  final Duration long;
  final Curve standard;
  final Curve enter;
  final Curve exit;

  static SuprMotion of(BuildContext context) {
    final value = Theme.of(context).extension<SuprMotion>();
    assert(value != null,
        'SuprMotion missing — wrap with SuprCircleTheme.light()');
    return value!;
  }

  /// Resolves [duration] to [Duration.zero] when animations are disabled.
  Duration resolve(BuildContext context, Duration duration) {
    if (MediaQuery.disableAnimationsOf(context)) {
      return Duration.zero;
    }
    return duration;
  }

  @override
  SuprMotion copyWith({
    Duration? instant,
    Duration? short,
    Duration? medium,
    Duration? long,
    Curve? standard,
    Curve? enter,
    Curve? exit,
  }) {
    return SuprMotion(
      instant: instant ?? this.instant,
      short: short ?? this.short,
      medium: medium ?? this.medium,
      long: long ?? this.long,
      standard: standard ?? this.standard,
      enter: enter ?? this.enter,
      exit: exit ?? this.exit,
    );
  }

  @override
  SuprMotion lerp(ThemeExtension<SuprMotion>? other, double t) {
    if (other is! SuprMotion) return this;
    // Curves are non-interpolable — snap at midpoint.
    final snap = t < 0.5;
    Duration ld(Duration a, Duration b) => Duration(
        milliseconds:
            (a.inMilliseconds + (b.inMilliseconds - a.inMilliseconds) * t)
                .round());
    return SuprMotion(
      instant: ld(instant, other.instant),
      short: ld(short, other.short),
      medium: ld(medium, other.medium),
      long: ld(long, other.long),
      standard: snap ? standard : other.standard,
      enter: snap ? enter : other.enter,
      exit: snap ? exit : other.exit,
    );
  }
}
