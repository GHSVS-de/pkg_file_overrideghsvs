#!/usr/bin/env node
const path = require('path');

/* Configure START */
const pathBuildKram = path.resolve("../buildKramGhsvs");
const updateXml = `${pathBuildKram}/build/update.xml`;
const changelogXml = `${pathBuildKram}/build/changelog.xml`;
const releaseTxt = `${pathBuildKram}/build/release.txt`;
/* Configure END */

const replaceXml = require(`${pathBuildKram}/build/replaceXml.js`);
const helper = require(`${pathBuildKram}/build/helper.js`);

const pc = require(`${pathBuildKram}/node_modules/picocolors`);
const fse = require(`${pathBuildKram}/node_modules/fs-extra`);

let replaceXmlOptions = {
	"xmlFile": '',
	"zipFilename": '',
	"checksum": '',
	"dirname": __dirname,
	"jsonString": ''
};
let zipOptions = {};
let from = "";
let to = "";
let source = '';
let what = '';

const {
	filename,
	name,
	nameReal,
	version,
} = require("./package.json");

const packagesDir = `./package/packages`;
const childDir = `${packagesDir}/file_${filename}`;

// By package abweichend. Nicht filename.
const manifestFileName = `${name}.xml`;
const Manifest = path.resolve(`./package/${manifestFileName}`);
const jsonMain = './package.json';

const manifestFileNameChild = `${filename}.xml`;
const manifestChild = `${childDir}/${manifestFileNameChild}`;
const jsonChild = `${childDir}/packageOverride.json`;

let thisPackages = [];

// Just an info file in each folder.
const versionInfo = `packageInfo.json`;

(async function exec()
{	let cleanOuts = [
		`./package`,
		`./dist`
	];
	await helper.cleanOut(cleanOuts);

	from = `./src`;
	to = `./package`;
	await helper.copy(from, to)

	// ##### The File(s) (child). START.

	// package/packages/file_assetghsvs/assetghsvs.xml
	let jsonString = await helper.mergeJson(
		[path.resolve(jsonMain), path.resolve(jsonChild)]
	)

	let tempPackage = JSON.parse(jsonString);
	let zipFilename = `${tempPackage.name}-${version}.zip`;

	replaceXmlOptions = Object.assign(
		replaceXmlOptions,
		{
			"xmlFile": path.resolve(manifestChild),
			"jsonString": jsonString
		}
	);

	await replaceXml.main(replaceXmlOptions);
	from = manifestChild;
	to = `./dist/${manifestFileNameChild}`
	await helper.copy(from, to)

	// ## Create child zip file.
	let zipFilePath = path.resolve(`./${packagesDir}/${zipFilename}`);

	zipOptions = {
		"source": path.resolve(childDir),
		"target": zipFilePath
	};
	await helper.zip(zipOptions);

	// The id element in <file ..> tag is not arbitrary! The id= should be set to the value of the element column in the #__extensions table. If they are not set correctly, upon uninstallation of the package, the child file will not be found and uninstalled.
	thisPackages.push(
		`<file type="${tempPackage.update.type}" id="${tempPackage.update.pkgId}">${zipFilename}</file>`
	);

	// Just a reference for myself. So that I have files at hand even without unzipping them.
	await helper.copy(
		childDir,
		`dist/overrideghsvs`
	)

	await helper.cleanOut([childDir]);
	// ##### The File(s) (child). END.

	// ##### The Package (main). START.
	zipFilename = `${nameReal}-${version}.zip`;

	// package/pkg_xyz.xml
	replaceXmlOptions = Object.assign(
		replaceXmlOptions,
		{
			"xmlFile": Manifest,
			"zipFilename": zipFilename,
			"thisPackages": thisPackages,
			"jsonString": ''
		}
	);

	await replaceXml.main(replaceXmlOptions);
	from = Manifest;
	to = `./dist/${manifestFileName}`
	await helper.copy(from, to)

	// ## Create main zip file.
	zipFilePath = path.resolve(`./dist/${zipFilename}`);

	zipOptions = {
		"source": path.resolve("package"),
		"target": zipFilePath
	};
	await helper.zip(zipOptions)

	replaceXmlOptions.checksum = await helper._getChecksum(zipFilePath);

	// Bei diesen werden zuerst Vorlagen nach dist/ kopiert und dort erst "replaced".
	for (const file of [updateXml, changelogXml, releaseTxt])
	{
		from = file;
		to = `./dist/${path.win32.basename(file)}`;
		await helper.copy(from, to)

		replaceXmlOptions.xmlFile = path.resolve(to);

		await replaceXml.main(replaceXmlOptions);
	}

	cleanOuts = [
		`./package`,
	];
	await helper.cleanOut(cleanOuts).then(
		answer => console.log(pc.cyan(pc.bold(pc.bgRed(
			`Finished. Good bye!`))))
	);
})();
