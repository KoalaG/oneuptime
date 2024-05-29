import TeamsElement from '../../Components/Team/TeamsElement';
import DashboardNavigation from '../../Utils/Navigation';
import PageComponentProps from '../PageComponentProps';
import URL from 'Common/Types/API/URL';
import DigestMethod from 'Common/Types/SSO/DigestMethod';
import SignatureMethod from 'Common/Types/SSO/SignatureMethod';
import Banner from 'CommonUI/src/Components/Banner/Banner';
import { ButtonStyleType } from 'CommonUI/src/Components/Button/Button';
import Card from 'CommonUI/src/Components/Card/Card';
import FormFieldSchemaType from 'CommonUI/src/Components/Forms/Types/FormFieldSchemaType';
import Link from 'CommonUI/src/Components/Link/Link';
import ConfirmModal from 'CommonUI/src/Components/Modal/ConfirmModal';
import CardModelDetail from 'CommonUI/src/Components/ModelDetail/CardModelDetail';
import ModelTable from 'CommonUI/src/Components/ModelTable/ModelTable';
import FieldType from 'CommonUI/src/Components/Types/FieldType';
import {
    DASHBOARD_URL,
    HOST,
    HTTP_PROTOCOL,
    IDENTITY_URL,
} from 'CommonUI/src/Config';
import DropdownUtil from 'CommonUI/src/Utils/Dropdown';
import Navigation from 'CommonUI/src/Utils/Navigation';
import Project from 'Model/Models/Project';
import ProjectSSO from 'Model/Models/ProjectSso';
import Team from 'Model/Models/Team';
import React, {
    Fragment,
    FunctionComponent,
    ReactElement,
    useState,
} from 'react';

const SSOPage: FunctionComponent<PageComponentProps> = (
    props: PageComponentProps
): ReactElement => {
    const [showSingleSignOnUrlId, setShowSingleSignOnUrlId] =
        useState<string>('');
    return (
        <Fragment>
            <>
                <Banner
                    openInNewTab={true}
                    title="Need help with configuring SSO?"
                    description="Watch this 10 minute video which will help you get set up"
                    link={URL.fromString('https://youtu.be/tq4WRgxbIwk')}
                />

                <ModelTable<ProjectSSO>
                    modelType={ProjectSSO}
                    query={{
                        projectId:
                            DashboardNavigation.getProjectId()?.toString(),
                    }}
                    id="sso-table"
                    name="Settings > Project SSO"
                    isDeleteable={true}
                    isEditable={true}
                    isCreateable={true}
                    cardProps={{
                        title: 'Single Sign On (SSO)',
                        description:
                            'Single sign-on is an authentication scheme that allows a user to log in with a single ID to any of several related, yet independent, software systems.',
                    }}
                    formSteps={[
                        {
                            title: 'Baisc Info',
                            id: 'basic',
                        },
                        {
                            title: 'Sign On',
                            id: 'sign-on',
                        },
                        {
                            title: 'Certificate',
                            id: 'certificate',
                        },
                        {
                            title: 'More',
                            id: 'more',
                        },
                    ]}
                    noItemsMessage={'No SSO configuration found.'}
                    viewPageRoute={Navigation.getCurrentRoute()}
                    formFields={[
                        {
                            field: {
                                name: true,
                            },
                            title: 'Name',
                            fieldType: FormFieldSchemaType.Text,
                            required: true,
                            description: 'Friendly name to help you remember.',
                            placeholder: 'Okta',
                            validation: {
                                minLength: 2,
                            },
                            stepId: 'basic',
                        },
                        {
                            field: {
                                description: true,
                            },
                            title: 'Description',
                            fieldType: FormFieldSchemaType.LongText,
                            required: true,
                            description:
                                'Friendly description to help you remember.',
                            placeholder: 'Sign in with Okta',
                            validation: {
                                minLength: 2,
                            },
                            stepId: 'basic',
                        },
                        {
                            field: {
                                signOnURL: true,
                            },
                            title: 'Sign On URL',
                            fieldType: FormFieldSchemaType.URL,
                            required: true,
                            description:
                                'Members will be forwarded here when signing in to your organization',
                            placeholder:
                                'https://yourapp.example.com/apps/appId',
                            stepId: 'sign-on',
                        },
                        {
                            field: {
                                issuerURL: true,
                            },
                            title: 'Issuer',
                            description:
                                'Typically a unique URL generated by your SAML identity provider',
                            fieldType: FormFieldSchemaType.URL,
                            required: true,
                            placeholder: 'https://example.com',
                            stepId: 'sign-on',
                        },
                        {
                            field: {
                                publicCertificate: true,
                            },
                            title: 'Public Certificate',
                            description: 'Paste in your x509 certificate here.',
                            fieldType: FormFieldSchemaType.LongText,
                            required: true,
                            placeholder: 'Paste in your x509 certificate here.',
                            stepId: 'certificate',
                        },
                        {
                            field: {
                                signatureMethod: true,
                            },
                            title: 'Signature Method',
                            description:
                                'If you do not know what this is, please leave this to RSA-SHA256',
                            fieldType: FormFieldSchemaType.Dropdown,
                            dropdownOptions:
                                DropdownUtil.getDropdownOptionsFromEnum(
                                    SignatureMethod
                                ),
                            required: true,
                            placeholder: 'RSA-SHA256',
                            stepId: 'certificate',
                        },
                        {
                            field: {
                                digestMethod: true,
                            },
                            title: 'Digest Method',
                            description:
                                'If you do not know what this is, please leave this to SHA256',
                            fieldType: FormFieldSchemaType.Dropdown,
                            dropdownOptions:
                                DropdownUtil.getDropdownOptionsFromEnum(
                                    DigestMethod
                                ),
                            required: true,
                            placeholder: 'SHA256',
                            stepId: 'certificate',
                        },
                        {
                            field: {
                                isEnabled: true,
                            },
                            description:
                                'You can test this first, before enabling it. To test, please save the config.',
                            title: 'Enabled',
                            fieldType: FormFieldSchemaType.Toggle,
                            stepId: 'more',
                        },
                        {
                            field: {
                                teams: true,
                            },
                            title: 'Teams',
                            description:
                                'Add users to these teams when they sign up',
                            fieldType: FormFieldSchemaType.MultiSelectDropdown,
                            dropdownModal: {
                                type: Team,
                                labelField: 'name',
                                valueField: '_id',
                            },
                            required: true,
                            placeholder: 'Select Teams',
                            stepId: 'more',
                        },
                    ]}
                    showRefreshButton={true}
                    actionButtons={[
                        {
                            title: 'View SSO Config',
                            buttonStyleType: ButtonStyleType.NORMAL,
                            onClick: async (
                                item: ProjectSSO,
                                onCompleteAction: VoidFunction
                            ) => {
                                setShowSingleSignOnUrlId(
                                    (item['_id'] as string) || ''
                                );
                                onCompleteAction();
                            },
                        },
                    ]}
                    filters={[
                        {
                            field: {
                                name: true,
                            },
                            title: 'Name',
                            type: FieldType.Text,
                        },
                        {
                            field: {
                                description: true,
                            },
                            title: 'Description',
                            type: FieldType.Text,
                        },
                        {
                            field: {
                                isEnabled: true,
                            },
                            title: 'Enabled',
                            type: FieldType.Boolean,
                        },
                    ]}
                    columns={[
                        {
                            field: {
                                name: true,
                            },
                            title: 'Name',
                            type: FieldType.Text,
                        },
                        {
                            field: {
                                description: true,
                            },
                            title: 'Description',
                            type: FieldType.Text,
                        },
                        {
                            field: {
                                teams: {
                                    name: true,
                                    _id: true,
                                    projectId: true,
                                },
                            },
                            title: 'Add User to Team',
                            type: FieldType.Text,
                            getElement: (item: ProjectSSO): ReactElement => {
                                return (
                                    <TeamsElement teams={item['teams'] || []} />
                                );
                            },
                        },
                        {
                            field: {
                                isEnabled: true,
                            },
                            title: 'Enabled',
                            type: FieldType.Boolean,
                        },
                    ]}
                />

                <Card
                    title={`Test Single Sign On (SSO)`}
                    description={
                        <span>
                            Here&apos;s a link which will help you test SSO
                            integration before you force it on your
                            organization:{' '}
                            <Link
                                openInNewTab={true}
                                to={URL.fromString(
                                    `${DASHBOARD_URL.toString()}/${DashboardNavigation.getProjectId()?.toString()}/sso`
                                )}
                            >
                                <span>{`${DASHBOARD_URL.toString()}/${DashboardNavigation.getProjectId()?.toString()}/sso`}</span>
                            </Link>
                        </span>
                    }
                />

                {/* API Key View  */}
                <CardModelDetail
                    name="SSO Settings"
                    editButtonText={'Edit Settings'}
                    cardProps={{
                        title: 'SSO Settings',
                        description: 'Configure settings for SSO.',
                    }}
                    isEditable={true}
                    formFields={[
                        {
                            field: {
                                requireSsoForLogin: true,
                            },
                            title: 'Force SSO for Login',
                            description:
                                'Please test SSO before you you enable this feature. If SSO is not tested properly then you will be locked out of the project.',
                            fieldType: FormFieldSchemaType.Toggle,
                        },
                    ]}
                    modelDetailProps={{
                        modelType: Project,
                        id: 'sso-settings',
                        fields: [
                            {
                                field: {
                                    requireSsoForLogin: true,
                                },
                                fieldType: FieldType.Boolean,
                                title: 'Force SSO for Login',
                                description:
                                    'Please test SSO before you enable this feature. If SSO is not tested properly then you will be locked out of the project.',
                            },
                        ],
                        modelId: DashboardNavigation.getProjectId()!,
                    }}
                />

                {showSingleSignOnUrlId && (
                    <ConfirmModal
                        title={`SSO Configuration`}
                        description={
                            <div>
                                <div>
                                    <div className="font-semibold">
                                        Identifier (Entity ID):{' '}
                                    </div>

                                    <div>{`${HTTP_PROTOCOL}${HOST}/${props.currentProject?._id}/${showSingleSignOnUrlId}`}</div>
                                    <br />
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        Reply URL (Assertion Consumer Service
                                        URL):
                                    </div>
                                    <div>
                                        {`${URL.fromString(
                                            IDENTITY_URL.toString()
                                        ).addRoute(
                                            `/idp-login/${props.currentProject?._id}/${showSingleSignOnUrlId}`
                                        )}`}
                                    </div>
                                    <br />
                                </div>
                            </div>
                        }
                        submitButtonText={'Close'}
                        onSubmit={() => {
                            setShowSingleSignOnUrlId('');
                        }}
                        submitButtonType={ButtonStyleType.NORMAL}
                    />
                )}
            </>
        </Fragment>
    );
};

export default SSOPage;
