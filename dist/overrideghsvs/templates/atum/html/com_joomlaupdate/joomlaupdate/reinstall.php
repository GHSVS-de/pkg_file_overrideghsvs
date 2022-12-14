<?php
/*
Part of pkg_file_overrideghsvs.
*/
defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Layout\LayoutHelper;

/** @var \Joomla\Component\Joomlaupdate\Administrator\View\Joomlaupdate\HtmlView $this */

/** @var \Joomla\CMS\WebAsset\WebAssetManager $wa */
$wa = $this->document->getWebAssetManager();
$wa->useScript('core')
    ->useScript('com_joomlaupdate.default')
    ->useScript('bootstrap.popover');

$uploadLink = 'index.php?option=com_joomlaupdate&view=upload';

$displayData = [
    'textPrefix' => 'COM_JOOMLAUPDATE_REINSTALL',
    'content'    => Text::sprintf($this->langKey, $this->updateSourceKey),
    'formURL'    => 'index.php?option=com_joomlaupdate&view=joomlaupdate',
    'helpURL'    => '',
    'icon'       => 'icon-loop joomlaupdate',
    'createURL'  => '#'
];

$displayData['additionalInfos'] = '<div>' . implode('<br>', [
	'Reinstall package URL: <a href="' . $this->updateInfo['object']->get('downloadurl')->_data . '">' . $this->updateInfo['object']->get('downloadurl')->_data . '</a>',
	'Reinstall Name: ' . $this->updateInfo['object']->get('name')->_data,
	'Reinstall Version: ' .  $this->updateInfo['object']->get('version')->_data
]) . '</div>';

if (isset($this->updateInfo['object']) && isset($this->updateInfo['object']->get('infourl')->_data)) :
    $displayData['content'] .= '<br>' . HTMLHelper::_(
        'link',
        $this->updateInfo['object']->get('infourl')->_data,
        Text::_('COM_JOOMLAUPDATE_VIEW_DEFAULT_INFOURL'),
        [
            'target' => '_blank',
            'rel'    => 'noopener noreferrer',
            'title'  => isset($this->updateInfo['object']->get('infourl')->title) ? Text::sprintf('JBROWSERTARGET_NEW_TITLE', $this->updateInfo['object']->get('infourl')->title) : ''
        ]
    );
endif;

if (Factory::getApplication()->getIdentity()->authorise('core.admin', 'com_joomlaupdate')) :
    $displayData['formAppend'] = '<div class=""><a href="' . $uploadLink . '" class="btn btn-sm btn-outline-secondary">' . Text::_('COM_JOOMLAUPDATE_EMPTYSTATE_APPEND') . '</a></div>';
endif;

echo '<div id="joomlaupdate-wrapper">';

echo LayoutHelper::render('joomla.content.emptystateGhsvs', $displayData);

echo '</div>';
