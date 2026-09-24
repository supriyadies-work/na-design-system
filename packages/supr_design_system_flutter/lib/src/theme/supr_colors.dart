import 'package:flutter/material.dart';

import '../generated/supr_circle_tokens.g.dart';

/// Semantic SuprCircle colors. Consume via [SuprColors.of].
@immutable
class SuprColors extends ThemeExtension<SuprColors> {
  const SuprColors({
    required this.surfaceCanvas,
    required this.surfaceHeader,
    required this.surfaceCard,
    required this.surfaceSubtle,
    required this.contentPrimary,
    required this.contentSecondary,
    required this.contentOnPrimary,
    required this.outlineDefault,
    required this.outlineSubtle,
    required this.shadowCard,
    required this.shadowNav,
    required this.actionPrimaryBackground,
    required this.actionPrimaryForeground,
    required this.actionPrimaryContainer,
    required this.actionPrimaryOnContainer,
    required this.actionSecondaryBackground,
    required this.actionSecondaryForeground,
    required this.feedbackSuccessContainer,
    required this.feedbackSuccessForeground,
    required this.feedbackInfoContainer,
    required this.feedbackInfoForeground,
    required this.feedbackAttentionContainer,
    required this.feedbackAttentionForeground,
    required this.navigationActive,
  });

  factory SuprColors.light() => const SuprColors(
        surfaceCanvas: SuprCircleTokens.suprcircle_color_surface_canvas,
        surfaceHeader: SuprCircleTokens.suprcircle_color_surface_header,
        surfaceCard: SuprCircleTokens.suprcircle_color_surface_card,
        surfaceSubtle: SuprCircleTokens.suprcircle_color_surface_subtle,
        contentPrimary: SuprCircleTokens.suprcircle_color_content_primary,
        contentSecondary: SuprCircleTokens.suprcircle_color_content_secondary,
        contentOnPrimary: SuprCircleTokens.suprcircle_color_content_onPrimary,
        outlineDefault: SuprCircleTokens.suprcircle_color_outline_default,
        outlineSubtle: SuprCircleTokens.suprcircle_color_outline_subtle,
        shadowCard: SuprCircleTokens.suprcircle_color_shadow_card,
        shadowNav: SuprCircleTokens.suprcircle_color_shadow_nav,
        actionPrimaryBackground:
            SuprCircleTokens.suprcircle_color_action_primary_background,
        actionPrimaryForeground:
            SuprCircleTokens.suprcircle_color_action_primary_foreground,
        actionPrimaryContainer:
            SuprCircleTokens.suprcircle_color_action_primary_container,
        actionPrimaryOnContainer:
            SuprCircleTokens.suprcircle_color_action_primary_onContainer,
        actionSecondaryBackground:
            SuprCircleTokens.suprcircle_color_action_secondary_background,
        actionSecondaryForeground:
            SuprCircleTokens.suprcircle_color_action_secondary_foreground,
        feedbackSuccessContainer:
            SuprCircleTokens.suprcircle_color_feedback_success_container,
        feedbackSuccessForeground:
            SuprCircleTokens.suprcircle_color_feedback_success_foreground,
        feedbackInfoContainer:
            SuprCircleTokens.suprcircle_color_feedback_info_container,
        feedbackInfoForeground:
            SuprCircleTokens.suprcircle_color_feedback_info_foreground,
        feedbackAttentionContainer:
            SuprCircleTokens.suprcircle_color_feedback_attention_container,
        feedbackAttentionForeground:
            SuprCircleTokens.suprcircle_color_feedback_attention_foreground,
        navigationActive: SuprCircleTokens.suprcircle_color_navigation_active,
      );

  final Color surfaceCanvas;
  final Color surfaceHeader;
  final Color surfaceCard;
  final Color surfaceSubtle;
  final Color contentPrimary;
  final Color contentSecondary;
  final Color contentOnPrimary;
  final Color outlineDefault;
  final Color outlineSubtle;
  final Color shadowCard;
  final Color shadowNav;
  final Color actionPrimaryBackground;
  final Color actionPrimaryForeground;
  final Color actionPrimaryContainer;
  final Color actionPrimaryOnContainer;
  final Color actionSecondaryBackground;
  final Color actionSecondaryForeground;
  final Color feedbackSuccessContainer;
  final Color feedbackSuccessForeground;
  final Color feedbackInfoContainer;
  final Color feedbackInfoForeground;
  final Color feedbackAttentionContainer;
  final Color feedbackAttentionForeground;
  final Color navigationActive;

  static SuprColors of(BuildContext context) {
    final value = Theme.of(context).extension<SuprColors>();
    assert(value != null,
        'SuprColors missing — wrap with SuprCircleTheme.light()');
    return value!;
  }

  @override
  SuprColors copyWith({
    Color? surfaceCanvas,
    Color? surfaceHeader,
    Color? surfaceCard,
    Color? surfaceSubtle,
    Color? contentPrimary,
    Color? contentSecondary,
    Color? contentOnPrimary,
    Color? outlineDefault,
    Color? outlineSubtle,
    Color? shadowCard,
    Color? shadowNav,
    Color? actionPrimaryBackground,
    Color? actionPrimaryForeground,
    Color? actionPrimaryContainer,
    Color? actionPrimaryOnContainer,
    Color? actionSecondaryBackground,
    Color? actionSecondaryForeground,
    Color? feedbackSuccessContainer,
    Color? feedbackSuccessForeground,
    Color? feedbackInfoContainer,
    Color? feedbackInfoForeground,
    Color? feedbackAttentionContainer,
    Color? feedbackAttentionForeground,
    Color? navigationActive,
  }) {
    return SuprColors(
      surfaceCanvas: surfaceCanvas ?? this.surfaceCanvas,
      surfaceHeader: surfaceHeader ?? this.surfaceHeader,
      surfaceCard: surfaceCard ?? this.surfaceCard,
      surfaceSubtle: surfaceSubtle ?? this.surfaceSubtle,
      contentPrimary: contentPrimary ?? this.contentPrimary,
      contentSecondary: contentSecondary ?? this.contentSecondary,
      contentOnPrimary: contentOnPrimary ?? this.contentOnPrimary,
      outlineDefault: outlineDefault ?? this.outlineDefault,
      outlineSubtle: outlineSubtle ?? this.outlineSubtle,
      shadowCard: shadowCard ?? this.shadowCard,
      shadowNav: shadowNav ?? this.shadowNav,
      actionPrimaryBackground:
          actionPrimaryBackground ?? this.actionPrimaryBackground,
      actionPrimaryForeground:
          actionPrimaryForeground ?? this.actionPrimaryForeground,
      actionPrimaryContainer:
          actionPrimaryContainer ?? this.actionPrimaryContainer,
      actionPrimaryOnContainer:
          actionPrimaryOnContainer ?? this.actionPrimaryOnContainer,
      actionSecondaryBackground:
          actionSecondaryBackground ?? this.actionSecondaryBackground,
      actionSecondaryForeground:
          actionSecondaryForeground ?? this.actionSecondaryForeground,
      feedbackSuccessContainer:
          feedbackSuccessContainer ?? this.feedbackSuccessContainer,
      feedbackSuccessForeground:
          feedbackSuccessForeground ?? this.feedbackSuccessForeground,
      feedbackInfoContainer:
          feedbackInfoContainer ?? this.feedbackInfoContainer,
      feedbackInfoForeground:
          feedbackInfoForeground ?? this.feedbackInfoForeground,
      feedbackAttentionContainer:
          feedbackAttentionContainer ?? this.feedbackAttentionContainer,
      feedbackAttentionForeground:
          feedbackAttentionForeground ?? this.feedbackAttentionForeground,
      navigationActive: navigationActive ?? this.navigationActive,
    );
  }

  @override
  SuprColors lerp(ThemeExtension<SuprColors>? other, double t) {
    if (other is! SuprColors) return this;
    return SuprColors(
      surfaceCanvas: Color.lerp(surfaceCanvas, other.surfaceCanvas, t)!,
      surfaceHeader: Color.lerp(surfaceHeader, other.surfaceHeader, t)!,
      surfaceCard: Color.lerp(surfaceCard, other.surfaceCard, t)!,
      surfaceSubtle: Color.lerp(surfaceSubtle, other.surfaceSubtle, t)!,
      contentPrimary: Color.lerp(contentPrimary, other.contentPrimary, t)!,
      contentSecondary:
          Color.lerp(contentSecondary, other.contentSecondary, t)!,
      contentOnPrimary:
          Color.lerp(contentOnPrimary, other.contentOnPrimary, t)!,
      outlineDefault: Color.lerp(outlineDefault, other.outlineDefault, t)!,
      outlineSubtle: Color.lerp(outlineSubtle, other.outlineSubtle, t)!,
      shadowCard: Color.lerp(shadowCard, other.shadowCard, t)!,
      shadowNav: Color.lerp(shadowNav, other.shadowNav, t)!,
      actionPrimaryBackground: Color.lerp(
          actionPrimaryBackground, other.actionPrimaryBackground, t)!,
      actionPrimaryForeground: Color.lerp(
          actionPrimaryForeground, other.actionPrimaryForeground, t)!,
      actionPrimaryContainer:
          Color.lerp(actionPrimaryContainer, other.actionPrimaryContainer, t)!,
      actionPrimaryOnContainer: Color.lerp(
        actionPrimaryOnContainer,
        other.actionPrimaryOnContainer,
        t,
      )!,
      actionSecondaryBackground: Color.lerp(
        actionSecondaryBackground,
        other.actionSecondaryBackground,
        t,
      )!,
      actionSecondaryForeground: Color.lerp(
        actionSecondaryForeground,
        other.actionSecondaryForeground,
        t,
      )!,
      feedbackSuccessContainer: Color.lerp(
        feedbackSuccessContainer,
        other.feedbackSuccessContainer,
        t,
      )!,
      feedbackSuccessForeground: Color.lerp(
        feedbackSuccessForeground,
        other.feedbackSuccessForeground,
        t,
      )!,
      feedbackInfoContainer:
          Color.lerp(feedbackInfoContainer, other.feedbackInfoContainer, t)!,
      feedbackInfoForeground:
          Color.lerp(feedbackInfoForeground, other.feedbackInfoForeground, t)!,
      feedbackAttentionContainer: Color.lerp(
        feedbackAttentionContainer,
        other.feedbackAttentionContainer,
        t,
      )!,
      feedbackAttentionForeground: Color.lerp(
        feedbackAttentionForeground,
        other.feedbackAttentionForeground,
        t,
      )!,
      navigationActive:
          Color.lerp(navigationActive, other.navigationActive, t)!,
    );
  }
}
