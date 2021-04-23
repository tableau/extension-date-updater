import * as React from 'react';

import { Button, Checkbox, DropdownSelect } from '@tableau/tableau-ui';

declare global {
    interface Window { tableau: any; }
}

export const Dates = {
    None: 'None',
    Today: 'Today',
    Yesterday: 'Yesterday',
    TwoDaysAgo: '2 Days Ago',
    SevenDaysAgo: '7 Days ago',
    ThirtyDaysAgo: '30 Days ago',
    SixtyDaysAgo: '60 Days ago',
    NinetyDaysAgo: '90 Days ago',
    SixMonthsAgo: '6 Months ago',
    OneYearAgo: '1 Year ago',
    BeginWeekSun: 'Beginning of Week (Sun)',
    BeginWeekMon: 'Beginning of Week (Mon)',
    BeginMonth: 'Beginning of Month',
    BeginQuarter: 'Beginning of Quarter',
    BeginYear: 'Beginning of Year',
} as const;

const DateOptions: string[] = Object.keys(Dates).map((date) => Dates[date as keyof typeof Dates]);

interface Parameter {
    name: string;
    selectedDate: string;
}

interface State {
    adjust: boolean,
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
        adjust: false,
        configured: false,
        datepart: 'days',
        no_params: false,
        num: 0,
        parameter: '',
        parameters: [],
    };

    // Updates parameter dropdowns
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

    // Handles change in adjust for time zone checkbox
    public adjustChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ adjust: e.target.checked });
    };

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
        window.tableau.extensions.settings.set('adjust', this.state.adjust);
        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog(this.state.parameter);
        });
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        window.tableau.extensions.initializeDialogAsync().then(() => {
            const settings = window.tableau.extensions.settings.getAll();
            if (settings.configured === 'true') {
                this.setState({
                    adjust: settings.adjust === 'true' || false,
                });
            }
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
                        <p className='error' style={{ display: (this.state.no_params === true) ? 'inline' : 'none' }}>No open input date parameters found.</p>
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
                        ))}
                    </div>
                </div>
                <div className='footer'>
                    <div className='btncluster'>
                        <Checkbox checked={this.state.adjust} onChange={this.adjustChange} style={{ width: '200px' }}>Adjust for timezone.</Checkbox>
                        <Button kind='filledGreen' onClick={this.submit}>OK</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Configure;
