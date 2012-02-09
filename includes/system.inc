<?php
/**
 * @file
 * System module integration.
 */

/**
 * Implements hook_form_alter().
 */
function aloha_form_alter(&$form, &$form_state, $form_id) {
  drupal_alter('aloha_form', $form, $form_state, $form_id);
}
