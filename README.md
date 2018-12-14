# Date Updater
No longer will you need to employ crazy hacks or manually update your date parameters. This extension allows you to refresh any date parameter to today's date whenever a workbook is opened.

## How to use an Extension
Download the Date Updater [manifest file](https://extensiongallery.tableau.com/products/28). Open Tableau Desktop 2018.2 or higher, drag in the "Extension" object to a dashboard. Click "My Extensions" and find the manifest file (.trex) you downloaded above.

## Using the Extension
1. Bring in the extension
2. In the configuration window, choose the date parameter to update
3. Click OK

Note: You can add as many instances of this extension as you like!

## How to install for local use
`yarn` to install

`yarn start` to run

`yarn build` to build

## Open source discrepancy notice
The source code found in this repository uses the Tableau UI components library. However, due to a bug in the current version of Qt used in Tableau Desktop, html selects do not allow for mouse selection on Mac and instead require the keyboard for selections. Because of this we will be using an alternative div dropdown in the production bundle until we are able to upgrade Qt.
