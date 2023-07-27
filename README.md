[![As-Is](https://img.shields.io/badge/Support%20Level-As--Is-e8762c.svg)](https://www.tableau.com/support-levels-it-and-developer-tools)

# Date Updater
No longer will you need to employ crazy hacks or manually update your date parameters. This extension allows you to refresh any date parameter to today's date whenever a workbook is opened.

## Using the Extension from Tableau Exchange (Recommended)
See the Tableau Help topic [Use Dashboard Extensions](https://help.tableau.com/current/pro/desktop/en-us/dashboard_extensions.htm) for directions. When presented with the list of available Dashboard Extensions, search for Date Updater to find and install this one.

### Using the Extension
1. Bring in the extension
2. In the configuration window you will see all date parameters listed
*Note: It must be a Date or Date-Time parameter and must allow "All" values*
3. Select what date you want to set the parameters to when the dashboard is loaded. If you don't want any updates on a parameter, choose None.
4. Click OK and watch your parameter update!

## Download the Extension Code to Develop Locally
If you want to use a locally-built version of this extension or if you want to make any of your own changes, follow these steps:
1. Make sure you have [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com) installed. 
2. Clone or download and unzip this repository. Open the command line to the `extension-date-updater-master` folder and run `yarn` to install the node modules.
3. Edit the `homepage` in the `package.json` file to the server where you are going to host the extension. For example:
```
"homepage": "http://localhost:8080",
```
4. In the command line run `yarn build` to build the extension with the new homepage. _Note, you can update the `package.json` file to just run `react-scripts build`, the rest is just to move the folders around. If you do this, look for the `build` folder in the next step._
5. Copy the files in `docs` to your web server at the path you specified in Step 3.
6. Update the existing or create a new manifest file (.trex) to point to the URL where you are hosting the extension with `/#/dateupdate` at the end. For example: `http://localhost:8080/#/dateupdate`.

## Support
Tableau customers can contact the Tableau Support team for help.

For any local build or code related questions, please post to the [Issues](https://github.com/tableau/extension-date-updater/issues) tab here for community support.
