import * as React from 'react';

import {
    ButtonType,
    ButtonWidget,
    DropdownType,
    DropdownWidget,
} from '@tableau/widgets';

declare global {
    interface Window { tableau: any; }
}

interface State {
    configured: boolean,
    datepart: string,
    no_params: boolean,
    num: number,
    parameter: string,
    parameters: any,
}

// Container for all configurations
class Configure extends React.Component<any, any> {
    public readonly state: State = {
        configured: false,
        datepart: 'days',
        no_params: false,
        num: 0,
        parameter: '',
        parameters: [],
    };

    constructor(props: any) {
        super(props);
        this.datepartChange = this.datepartChange.bind(this);
        this.populateParams = this.populateParams.bind(this);
        this.submit = this.submit.bind(this);
    }

    // Handles change in dropdown
    public datepartChange = (value: any): void => {
        const update = value.split(/-(.+)/)[0]
        const param = value.split(/-(.+)/)[1]
        const state = this.state.parameters;
        state.find((p: any) => p.name === param).update = update;
        this.setState({
            parameters: state,
        });
    };
    
    public sortBy(prop: string) {
        return (a: any, b: any) => {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }
    
    // Gets list of all open input date parameters
    public populateParams() {
        const settings  = window.tableau.extensions.settings.getAll();
        window.tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((params: any) => {
            const options = [];
            const dateparts = [
                {value: 'none', displayValue: 'None'},
                {value: 'today', displayValue: 'Today'},
                {value: 'yesterday', displayValue: 'Yesterday'},
                {value: 'week', displayValue: '7 Days ago'},
                {value: 'month', displayValue: '30 Days ago'},
            ];
            for (const p of params) {
                let u: any;
                if (settings.configured === 'true') {
                    u = JSON.parse(window.tableau.extensions.settings.getAll().parameters).find((param: any) => param.name === p.name);
                }
                if (p.allowableValues.type === 'all' && (p.dataType === 'date' || p.dataType === 'date-time')) {
                    options.push({
                        dates: dateparts.map(v => ({value: v.value+'-'+p.name, displayValue: v.displayValue})),
                        name: p.name,
                        update: (u) ? u.update : 'none',
                    });
                }
            }
            options.sort(this.sortBy('name'));

            if (options.length > 0 ) {
                this.setState({
                    no_params: false,
                    parameters: options,
                });
            } else {
                this.setState({
                    no_params: true,
                    parameters: [],
                });
            }
        });
    }
    
    // Saves settings and closes configure dialog with parameter payload
    public submit() {
        window.tableau.extensions.settings.set('configured', 'true');
        window.tableau.extensions.settings.set('parameters', JSON.stringify(this.state.parameters));
        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog(this.state.parameter);
        });
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        const uiPromise = window.tableau.extensions.initializeDialogAsync();
        if (uiPromise) {
            uiPromise.then(() => {
                this.populateParams()
            });
        } 
    }
    
    public render() {        
        return (
            <div className='container'>
                <div className='header'>
                    Date Updater Configuration
                </div>
                <div>
                    <p className='text'>Choose the date for the parameters you want to automatically update.</p>
                    <div className='scrolly'>
                    <p className='error' style={{display: (this.state.no_params === true) ? 'inline' : 'none'}}>No open input date parameters found.</p>
                        {this.state.parameters.map( (p: any) => (
                            <div className='dateset'>
                                <div className='pleft'>
                                    {p.name}
                                </div>
                                <div className='pright'>
                                    <DropdownWidget label='' testId={p.name} dropdownType={DropdownType.Line} menuItemInfos={p.dates} onSelect={this.datepartChange} selectedValue={p.update+'-'+p.name}/>
                                </div>
                            </div>
                        ) )}
                    </div>
                </div>
                <div className='footer'>
                    <div className='btncluster'>
                        <ButtonWidget buttonType={ButtonType.Go} handleClick={this.submit} testId='set-parameter'>OK</ButtonWidget>
                    </div>
                </div>
            </div>
        );
    }
}

export default Configure;