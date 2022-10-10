<?php
/*
Part of pkg_file_overrideghsvs.
*/
defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Layout\LayoutHelper;
use Joomla\CMS\Session\Session;

$displayData = [
    'textPrefix' => 'COM_INSTALLER',
    'formURL'    => '',
    'helpURL'    => '',
    'icon'       => '',
		//'content' => ' ',
		'title' => ' '
];

$user = Factory::getApplication()->getIdentity();

if ($user->authorise('core.create', 'com_content') || count($user->getAuthorisedCategories('com_content', 'core.create')) > 0) {
    // $displayData['createURL'] = 'index.php?option=com_installer&task=update.find&' . Session::getFormToken() . '=1';
}

echo LayoutHelper::render('joomla.content.emptystateGhsvs', $displayData);
