import * as React from 'react';

import { Button, DropdownSelect } from '@tableau/tableau-ui';

declare global {
    interface Window { tableau: any; }
}

export enum Dates {
    None = 'None',
    Today = 'Today',
    Yesterday = 'Yesterday',
    SevenDaysAgo = '7 Days ago',
    ThirtyDaysAgo = '30 Days ago',
    SixtyDaysAgo = '60 Days ago',
    NinetyDaysAgo = '90 Days ago',
    SixMonthsAgo = '6 Months ago',
    OneYearAgo = '1 Year ago',
}

const DateOptions: string[] = Object.keys(Dates).map(date => Dates[date]);

interface Parameter {
    name: string;
    selectedDate: string;
}

interface State {
    configured: boolean;
    datepart: string;
    no_params: boolean;
    num: number;
    parameter: string;
    parameters: Parameter[];
}

function sortBy(prop: string) {
    return (a: any, b: any) => {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
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

    public onDatePartChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLSelectElement>) => void) => {
        return (e: React.ChangeEvent<HTMLSelectElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.selectedDate = e.target.value;
                this.setState({ parameters });
            }
        }
    }

    // Gets list of all open input date parameters
    public populateParams = (): void => {
        const settings = window.tableau.extensions.settings.getAll();
        window.tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((dashboardParameters: any) => {
            const parameters: Parameter[] = [];
            const configuredParameters = (settings.parameters) ? JSON.parse(settings.parameters) : [];
            for (const dashboardParameter of dashboardParameters) {
                let configuredParameter: any;
                if (settings.configured === 'true') {
                    configuredParameter = configuredParameters.find((parameter: any) => parameter.name === dashboardParameter.name);
                }
                if (dashboardParameter.allowableValues.type === 'all' && (dashboardParameter.dataType === 'date' || dashboardParameter.dataType === 'date-time')) {
                    const selectedDate: string = configuredParameter ? configuredParameter.selectedDate : Dates.None;
                    parameters.push({
                        name: dashboardParameter.name,
                        selectedDate,
                    });
                }
            }

            parameters.sort(sortBy('name'));

            this.setState({
                no_params: Object.keys(parameters).length === 0,
                parameters,
            });
        });
    }

    // Saves settings and closes configure dialog with parameter payload
    public submit = (): void => {
        window.tableau.extensions.settings.set('configured', 'true');
        window.tableau.extensions.settings.set('parameters', JSON.stringify(this.state.parameters));
        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog(this.state.parameter);
        });
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        window.tableau.extensions.initializeDialogAsync().then(() => {
            this.populateParams();
        });
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
                        {this.state.parameters.map((p: Parameter) => (
                            <div className='dateset' key={`dataset-${p.name}`}>
                                <div className='pleft'>
                                    {p.name}
                                </div>
                                <div className='pright'>
                                <DropdownSelect className='dropdown-select' kind='line' onChange={this.onDatePartChangeWrapper(p.name)} onSelect={this.onDatePartChangeWrapper(p.name)} value={p.selectedDate}>
                                    {DateOptions.map((option: string) => <option key={option}>{option}</option>)}
                                </DropdownSelect>
                                </div>
                            </div>
                        ) )}
                    </div>
                </div>
                <div className='footer'>
                    <div className='btncluster'>
                        <Button kind='filledGreen' onClick={this.submit}>OK</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Configure;