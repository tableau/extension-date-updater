import * as React from 'react';
import { Dates } from './Configure';
import './style.css';

/* tslint:disable:no-console */

declare global {
    interface Window { tableau: any; }
}

interface State {
    mode: string,
}

class DateUpdater extends React.Component<any, State> {
    public readonly state: State = {
        mode: 'authoring',
    };

    public updateParameters(parameters: any) {
        parameters = JSON.parse(parameters);

        // Start backwards compatibility conversion //
        for (const parameter of parameters) {
            if (parameter.selectedDate) {
                break;
            } else {
                if (parameter.update) {
                    switch (parameter.update) {
                        case 'today':
                            parameter.selectedDate = Dates.Today;
                            break;
                        case 'yesterday':
                            parameter.selectedDate = Dates.Yesterday;
                            break;
                        case 'week':
                            parameter.selectedDate = Dates.SevenDaysAgo;
                            break;
                        case 'month':
                            parameter.selectedDate = Dates.ThirtyDaysAgo;
                            break;
                        default:
                            parameter.selectedDate = Dates.None;
                    }
                    delete parameter.update
                    delete parameter.dates
                }
            }
        }
        window.tableau.extensions.settings.set('parameters', JSON.stringify(parameters));
        window.tableau.extensions.settings.saveAsync();
        // End backwards compatibility conversion //

        window.tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((dashboardParameters: any) => {
            dashboardParameters.forEach((dashboardParameter: any) => {
                if (dashboardParameter.allowableValues.type === 'all' && (dashboardParameter.dataType === 'date' || dashboardParameter.dataType === 'date-time')) {
                    const parameter = parameters.find((p: any) => p.name === dashboardParameter.name);
                    if (parameter) {
                        const date = new Date();
                        switch (parameter.selectedDate) {
                            case Dates.Yesterday:
                                date.setDate(date.getDate() - 1);
                                break;
                            case Dates.SevenDaysAgo:
                                date.setDate(date.getDate() - 7);
                                break;
                            case Dates.ThirtyDaysAgo:
                                date.setDate(date.getDate() - 30);
                                break;
                        }
                        if (parameter.selectedDate !== Dates.None) {
                            dashboardParameter.changeValueAsync(date);
                        }
                    }
                }
            });
        });
    }

    // Pops open the configure dialog
    public configure = (): void => {
        const popupUrl = (window.location.origin.includes('localhost')) ? `${window.location.origin}/#/config` : `${window.location.origin}/extension-date-updater/#/config`;
        const payload = '';
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 250, width: 375 }).then(() => {
            const settings = window.tableau.extensions.settings.getAll();
            this.updateParameters(settings.parameters);
        }).catch((error: any) => {
            switch (error.errorCode) {
                case window.tableau.ErrorCodes.DialogClosedByUser:
                    console.log('Dialog was closed by user.');
                    break;
                default:
                    console.error(error.message);
            }
        });
    }

    // Prior to mounting we initialize
    public componentWillMount() {
        window.tableau.extensions.initializeAsync({ configure: this.configure }).then(() => {
            this.setState({
                mode: window.tableau.extensions.environment.mode,
            });
            const settings = window.tableau.extensions.settings.getAll();
            if (settings.configured !== 'true') {
                this.configure();
            } else {
                this.updateParameters(settings.parameters);
            }
        });
    }

    public render() {
        return (
            <div className={'cog ' + this.state.mode} title='This cog will not show in viewer mode.'>
                <svg className='svg-inline--fa fa-cog fa-w-16 fa-2x click' onClick={this.configure} aria-labelledby='svg-inline--fa-title-1' data-prefix='fas' data-icon='cog' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' data-fa-i2svg='true'>
                    <path fill='currentColor' d='M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z' />
                </svg>
            </div>
        );
    }
}

export default DateUpdater;