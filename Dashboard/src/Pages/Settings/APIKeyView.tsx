import LabelsElement from '../../Components/Label/Labels';
import DashboardNavigation from '../../Utils/Navigation';
import PageMap from '../../Utils/PageMap';
import RouteMap from '../../Utils/RouteMap';
import PageComponentProps from '../PageComponentProps';
import Route from 'Common/Types/API/Route';
import BadDataException from 'Common/Types/Exception/BadDataException';
import ObjectID from 'Common/Types/ObjectID';
import Permission, { PermissionHelper } from 'Common/Types/Permission';
import { FormProps } from 'CommonUI/src/Components/Forms/BasicForm';
import FormFieldSchemaType from 'CommonUI/src/Components/Forms/Types/FormFieldSchemaType';
import FormValues from 'CommonUI/src/Components/Forms/Types/FormValues';
import ModelDelete from 'CommonUI/src/Components/ModelDelete/ModelDelete';
import CardModelDetail from 'CommonUI/src/Components/ModelDetail/CardModelDetail';
import ModelTable from 'CommonUI/src/Components/ModelTable/ModelTable';
import ResetObjectID from 'CommonUI/src/Components/ResetObjectID/ResetObjectID';
import FieldType from 'CommonUI/src/Components/Types/FieldType';
import Navigation from 'CommonUI/src/Utils/Navigation';
import PermissionUtil from 'CommonUI/src/Utils/Permission';
import ApiKey from 'Model/Models/ApiKey';
import ApiKeyPermission from 'Model/Models/ApiKeyPermission';
import Label from 'Model/Models/Label';
import TeamPermission from 'Model/Models/TeamPermission';
import React, {
    Fragment,
    FunctionComponent,
    MutableRefObject,
    ReactElement,
} from 'react';

const APIKeyView: FunctionComponent<PageComponentProps> = (
    props: PageComponentProps
): ReactElement => {
    const modelId: ObjectID = Navigation.getLastParamAsObjectID();
    const [refresher, setRefresher] = React.useState<boolean>(false);

    const formRef: MutableRefObject<FormProps<FormValues<ApiKeyPermission>>> =
        React.useRef<
            FormProps<FormValues<ApiKeyPermission>>
        >() as MutableRefObject<FormProps<FormValues<ApiKeyPermission>>>;

    return (
        <Fragment>
            {/* API Key View  */}
            <CardModelDetail<ApiKey>
                name="API Key Details"
                cardProps={{
                    title: 'API Key Details',
                    description: 'Here are more details for this API Key.',
                }}
                refresher={refresher}
                isEditable={true}
                formFields={[
                    {
                        field: {
                            name: true,
                        },
                        title: 'Name',
                        fieldType: FormFieldSchemaType.Text,
                        required: true,
                        placeholder: 'API Key Name',
                        validation: {
                            minLength: 2,
                        },
                    },
                    {
                        field: {
                            description: true,
                        },
                        title: 'Description',
                        fieldType: FormFieldSchemaType.LongText,
                        required: true,
                        placeholder: 'API Key Description',
                    },
                    {
                        field: {
                            expiresAt: true,
                        },
                        title: 'Expires',
                        fieldType: FormFieldSchemaType.Date,
                        required: true,
                        placeholder: 'Expires at',
                        validation: {
                            dateShouldBeInTheFuture: true,
                        },
                    },
                ]}
                modelDetailProps={{
                    modelType: ApiKey,
                    id: 'model-detail-api-key',
                    fields: [
                        {
                            field: {
                                name: true,
                            },
                            title: 'Name',
                        },
                        {
                            field: {
                                description: true,
                            },
                            title: 'Description',
                        },
                        {
                            field: {
                                expiresAt: true,
                            },
                            title: 'Expires',
                            fieldType: FieldType.Date,
                        },
                        {
                            field: {
                                apiKey: true,
                            },
                            title: 'API Key',
                            fieldType: FieldType.HiddenText,
                            opts: {
                                isCopyable: true,
                            },
                        },
                    ],
                    modelId: modelId,
                }}
            />

            {/* API Key Permisison Table */}

            <ModelTable<ApiKeyPermission>
                modelType={ApiKeyPermission}
                id="api-key-permission-table"
                isDeleteable={true}
                name="Settings > API Key > Permissions"
                query={{
                    apiKeyId: modelId,
                    projectId: DashboardNavigation.getProjectId()?.toString(),
                }}
                onBeforeCreate={(
                    item: ApiKeyPermission
                ): Promise<ApiKeyPermission> => {
                    if (!props.currentProject || !props.currentProject._id) {
                        throw new BadDataException('Project ID cannot be null');
                    }

                    item.apiKeyId = modelId;
                    item.projectId = new ObjectID(props.currentProject._id);
                    return Promise.resolve(item);
                }}
                isEditable={true}
                isCreateable={true}
                isViewable={false}
                cardProps={{
                    title: 'API Key Permissions',
                    description:
                        'Add different permisisons to API keys to make it more granular.',
                }}
                noItemsMessage={
                    'No permisisons created for this API Key so far.'
                }
                createEditFromRef={formRef}
                formFields={[
                    {
                        field: {
                            permission: true,
                        },
                        onChange: async (_value: any) => {
                            await formRef.current.setFieldValue(
                                'labels',
                                [],
                                true
                            );
                        },
                        title: 'Permission',
                        fieldType: FormFieldSchemaType.Dropdown,
                        required: true,
                        placeholder: 'Permission',
                        dropdownOptions:
                            PermissionUtil.projectPermissionsAsDropdownOptions(),
                    },
                    {
                        field: {
                            labels: true,
                        },
                        title: 'Labels ',
                        description:
                            'Labels on which this permissions will apply on. This is optional and an advanced feature.',
                        fieldType: FormFieldSchemaType.MultiSelectDropdown,
                        dropdownModal: {
                            type: Label,
                            labelField: 'name',
                            valueField: '_id',
                        },
                        showIf: (
                            values: FormValues<TeamPermission>
                        ): boolean => {
                            if (!values['permission']) {
                                return false;
                            }

                            if (
                                values['permission'] &&
                                !PermissionHelper.isAccessControlPermission(
                                    values['permission'] as Permission
                                )
                            ) {
                                return false;
                            }

                            return true;
                        },
                        required: false,
                        placeholder: 'Labels',
                    },
                ]}
                showRefreshButton={true}
                viewPageRoute={Navigation.getCurrentRoute()}
                filters={[
                    {
                        field: {
                            permission: true,
                        },
                        title: 'Permission',
                        type: FieldType.Text,
                    },
                    {
                        field: {
                            labels: {
                                name: true,
                            },
                        },
                        title: 'Labels',
                        type: FieldType.EntityArray,
                        filterEntityType: Label,
                        filterQuery: {
                            projectId:
                                DashboardNavigation.getProjectId()?.toString(),
                        },
                        filterDropdownField: {
                            label: 'name',
                            value: '_id',
                        },
                    },
                ]}
                columns={[
                    {
                        field: {
                            permission: true,
                        },
                        title: 'Permission',
                        type: FieldType.Text,

                        getElement: (item: ApiKeyPermission): ReactElement => {
                            return (
                                <p>
                                    {PermissionHelper.getTitle(
                                        item['permission'] as Permission
                                    )}
                                </p>
                            );
                        },
                    },
                    {
                        field: {
                            labels: {
                                name: true,
                                color: true,
                            },
                        },
                        title: 'Labels',
                        type: FieldType.EntityArray,

                        getElement: (item: ApiKeyPermission): ReactElement => {
                            if (
                                item &&
                                item['permission'] &&
                                !PermissionHelper.isAccessControlPermission(
                                    item['permission'] as Permission
                                )
                            ) {
                                return (
                                    <p>
                                        Labels can not be attached to this
                                        permission.
                                    </p>
                                );
                            }

                            return (
                                <LabelsElement labels={item['labels'] || []} />
                            );
                        },
                    },
                ]}
            />

            <ResetObjectID<ApiKey>
                modelType={ApiKey}
                fieldName={'apiKey'}
                title={'Reset API Key'}
                description={'Reset the API Key to a new value.'}
                modelId={modelId}
                onUpdateComplete={() => {
                    setRefresher(!refresher);
                }}
            />

            <ModelDelete
                modelType={ApiKey}
                modelId={modelId}
                onDeleteSuccess={() => {
                    Navigation.navigate(
                        RouteMap[PageMap.SETTINGS_APIKEYS] as Route
                    );
                }}
            />
        </Fragment>
    );
};

export default APIKeyView;
