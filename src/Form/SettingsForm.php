<?php

namespace Drupal\plagx_draft_preflight\Form;

use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Default word limits, citation style and checks for the Draft Preflight panel.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * Every check the Preflight rules support.
   */
  const CHECKS = ['length', 'references', 'punctuation', 'grammar', 'passive-voice'];

  /**
   * The module extension list, used for the icon path.
   *
   * @var \Drupal\Core\Extension\ModuleExtensionList
   */
  protected ModuleExtensionList $moduleList;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $instance = parent::create($container);
    $instance->moduleList = $container->get('extension.list.module');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'plagx_draft_preflight_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['plagx_draft_preflight.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('plagx_draft_preflight.settings');
    $module_path = $this->moduleList->getPath('plagx_draft_preflight');

    $form['#attached']['library'][] = 'plagx_draft_preflight/settings';
    $form['#attributes']['class'][] = 'plagx-settings';

    $form['hero'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['plagx-hero']],
      'icon' => [
        '#theme' => 'image',
        '#uri' => $module_path . '/images/pcx-icon.png',
        '#width' => 48,
        '#height' => 48,
        '#alt' => '',
      ],
      'text' => [
        '#type' => 'container',
        'title' => [
          '#markup' => $this->t('<h2>Draft Preflight <span class="plagx-badge">v@version</span></h2>', ['@version' => '0.1.3']),
        ],
        'intro' => [
          '#type' => 'html_tag',
          '#tag' => 'p',
          '#value' => $this->t('Defaults for the Draft Preflight panel on the content edit form. Word limits and citation style can also be changed in the panel for each check.'),
        ],
      ],
    ];

    $form['limits'] = [
      '#type' => 'details',
      '#title' => $this->t('Word limits and citations'),
      '#open' => TRUE,
      '#attributes' => ['class' => ['plagx-card']],
    ];
    $form['limits']['min_words'] = [
      '#type' => 'number',
      '#title' => $this->t('Minimum words'),
      '#min' => 0,
      '#step' => 1,
      '#default_value' => (int) $config->get('min_words'),
      '#description' => $this->t('0 means no limit.'),
    ];
    $form['limits']['max_words'] = [
      '#type' => 'number',
      '#title' => $this->t('Maximum words'),
      '#min' => 0,
      '#step' => 1,
      '#default_value' => (int) $config->get('max_words'),
      '#description' => $this->t('0 means no limit.'),
    ];
    $form['limits']['style'] = [
      '#type' => 'select',
      '#title' => $this->t('Citation style'),
      '#options' => ['apa' => $this->t('APA 7'), 'mla' => $this->t('MLA 9')],
      '#default_value' => $config->get('style') === 'mla' ? 'mla' : 'apa',
    ];

    $form['checks_card'] = [
      '#type' => 'details',
      '#title' => $this->t('Checks'),
      '#open' => TRUE,
      '#attributes' => ['class' => ['plagx-card']],
    ];
    $form['checks_card']['checks'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Checks to run'),
      '#title_display' => 'invisible',
      '#options' => [
        'length' => $this->t('Length and structure: word limits, long sentences and long paragraphs'),
        'references' => $this->t('Citations and reference list: citations with no reference, and references never cited'),
        'punctuation' => $this->t('Punctuation: unmatched quotes and brackets, spacing around punctuation'),
        'grammar' => $this->t('Basic grammar: repeated words, a / an, sentence capitals, word confusions'),
        'passive-voice' => $this->t('Passive voice: hints where an active sentence may read better'),
      ],
      '#default_value' => (array) $config->get('checks'),
    ];

    $link = Link::fromTextAndUrl(
      $this->t('Text Similarity Detector'),
      Url::fromUri('https://plagiarismcheckerx.com/', ['query' => ['utm_source' => 'plagx-preflight-drupal']])
    )->toString();
    $form['credit'] = [
      '#type' => 'html_tag',
      '#tag' => 'p',
      '#attributes' => ['class' => ['plagx-credit']],
      '#value' => $this->t('Made by Plagiarism Checker X. For full plagiarism checking and AI-text detection, visit @link.', ['@link' => $link]),
      '#weight' => 1000,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $checks = array_values(array_intersect(self::CHECKS, array_keys(array_filter((array) $form_state->getValue('checks')))));
    $this->config('plagx_draft_preflight.settings')
      ->set('min_words', max(0, (int) $form_state->getValue('min_words')))
      ->set('max_words', max(0, (int) $form_state->getValue('max_words')))
      ->set('style', $form_state->getValue('style') === 'mla' ? 'mla' : 'apa')
      ->set('checks', $checks)
      ->save();
    parent::submitForm($form, $form_state);
  }

}
