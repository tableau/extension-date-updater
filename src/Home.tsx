import * as React from 'react';
import './home.css';

class Home extends React.Component<any, any> {
	public render() {
		return (
			<React.Fragment>
				<link rel='stylesheet' type='text/css' media='screen' href='home.css' />
				<div className='icontainer'>
					<div className='box'>
						<div className='left'>
							<h1 className='iheader'>Date Updater</h1>
							<span className='tagline'>Automatically update your date parameters to today's date.</span>
						</div>
						<div className='right'>
							<h4 className='big'>What is it?</h4>
							<p>With this extension, no longer will you need to employ crazy hacks or manually update your date parameters. This extension allows you to refresh any date parameter to today's date whenever a workbook is opened.</p>
							<h4 className='big'>Using the Extension</h4>
							<ol>
								<li>Bring in the extension</li>
								<li>In the configuration window, choose the date parameter to update</li>
								<li>Click OK</li>
							</ol>
							<p><b>Note:</b> You can add as many instances of this extension as you like!</p>
							<div className='gh'>
							Get this extension and more in the <a href='https://extensiongallery.tableau.com/'>Extension Gallery</a>.
								{/* <a href='https://github.com/tableau/extension-date-updater'>View on GitHub</a> */}
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Home;