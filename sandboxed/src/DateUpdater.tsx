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

// Switches base URL based on where extension is being hosted
const baseURL: string = window.location.origin.includes('localhost:3000') ? window.location.origin : '.';

class DateUpdater extends React.Component<any, State> {
    public readonly state: State = {
        mode: 'authoring',
    };

    public updateParameters(parameters: any) {
        const settings = window.tableau.extensions.settings.getAll();
        parameters = JSON.parse(parameters);

        // Start backwards compatibility conversion //
        if (window.tableau.extensions.environment.mode === "authoring") {
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
        }
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
                            case Dates.SixtyDaysAgo:
                                date.setDate(date.getDate() - 60);
                                break;
                            case Dates.NinetyDaysAgo:
                                date.setDate(date.getDate() - 90);
                                break;
                            case Dates.SixMonthsAgo:
                                date.setMonth(date.getMonth() - 6);
                                break;
                            case Dates.OneYearAgo:
                                date.setMonth(date.getMonth() - 12);
                                break;
                            case Dates.BeginWeekSun:
                                date.setDate(date.getDate() - date.getDay());
                                break;
                            case Dates.BeginWeekMon:
                                date.setDate(date.getDate() - date.getDay() + 1);
                                break;
                            case Dates.BeginMonth:
                                date.setDate(1);
                                break;
                            case Dates.BeginQuarter:
                                date.setDate(1);
                                date.setMonth((Math.ceil((date.getMonth() + 1) / 3) - 1) * 3);
                                break;
                            case Dates.BeginYear:
                                date.setDate(1);
                                date.setMonth(0);
                                break;
                        }
                        if (parameter.selectedDate !== Dates.None) {
                            if (settings.adjust === 'true') {
                                date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
                            }
                            dashboardParameter.changeValueAsync(date);
                        }
                    }
                }
            });
        });
    }

    // Pops open the configure dialog
    public configure = (): void => {
        const popupUrl = `${baseURL}/config.html`;
        const payload = '';
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 260, width: 375 }).then(() => {
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
                <svg className="click" onClick={this.configure} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" /></svg>
            </div>
        );
    }
}

export default DateUpdater;
