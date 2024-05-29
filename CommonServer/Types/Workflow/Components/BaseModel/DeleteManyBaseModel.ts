import DatabaseService from '../../../../Services/DatabaseService';
import Query from '../../../Database/Query';
import ComponentCode, { RunOptions, RunReturnType } from '../../ComponentCode';
import BaseModel from 'Common/Models/BaseModel';
import { LIMIT_PER_PROJECT } from 'Common/Types/Database/LimitMax';
import BadDataException from 'Common/Types/Exception/BadDataException';
import { JSONObject } from 'Common/Types/JSON';
import JSONFunctions from 'Common/Types/JSONFunctions';
import PositiveNumber from 'Common/Types/PositiveNumber';
import Text from 'Common/Types/Text';
import ComponentMetadata, { Port } from 'Common/Types/Workflow/Component';
import BaseModelComponents from 'Common/Types/Workflow/Components/BaseModel';

export default class DeleteManyBaseModel<
    TBaseModel extends BaseModel
> extends ComponentCode {
    private modelService: DatabaseService<TBaseModel> | null = null;

    public constructor(modelService: DatabaseService<TBaseModel>) {
        super();

        const BaseModelComponent: ComponentMetadata | undefined =
            BaseModelComponents.getComponents(modelService.getModel()).find(
                (i: ComponentMetadata) => {
                    return (
                        i.id ===
                        `${Text.pascalCaseToDashes(
                            modelService.getModel().tableName!
                        )}-delete-many`
                    );
                }
            );

        if (!BaseModelComponent) {
            throw new BadDataException(
                'Delete many component for ' +
                    modelService.getModel().tableName +
                    ' not found.'
            );
        }
        this.setMetadata(BaseModelComponent);
        this.modelService = modelService;
    }

    public override async run(
        args: JSONObject,
        options: RunOptions
    ): Promise<RunReturnType> {
        const successPort: Port | undefined = this.getMetadata().outPorts.find(
            (p: Port) => {
                return p.id === 'success';
            }
        );

        if (!successPort) {
            throw options.onError(
                new BadDataException('Success port not found')
            );
        }

        const errorPort: Port | undefined = this.getMetadata().outPorts.find(
            (p: Port) => {
                return p.id === 'error';
            }
        );

        if (!errorPort) {
            throw options.onError(new BadDataException('Error port not found'));
        }

        try {
            if (!this.modelService) {
                throw options.onError(
                    new BadDataException('modelService is undefined.')
                );
            }

            if (!args['query']) {
                throw options.onError(
                    new BadDataException('Query is undefined.')
                );
            }

            if (typeof args['query'] === 'string') {
                args['query'] = JSONFunctions.parse(args['query'] as string);
            }

            if (typeof args['query'] !== 'object') {
                throw options.onError(
                    new BadDataException('Query is should be of type object.')
                );
            }

            if (args['skip'] && typeof args['skip'] === 'string') {
                args['skip'] = parseInt(args['skip']);
            }

            if (args['limit'] && typeof args['limit'] === 'string') {
                args['limit'] = parseInt(args['limit']);
            }

            if (typeof args['skip'] !== 'number') {
                args['skip'] = 0;
            }

            if (typeof args['limit'] !== 'number') {
                args['limit'] = 10;
            }

            if (
                typeof args['limit'] === 'number' &&
                args['limit'] > LIMIT_PER_PROJECT
            ) {
                options.log('Limit cannot be ' + args['limit']);
                options.log('Setting the limit to ' + LIMIT_PER_PROJECT);
                args['limit'] = LIMIT_PER_PROJECT;
            }

            if (this.modelService.getModel().getTenantColumn()) {
                (args['query'] as JSONObject)[
                    this.modelService.getModel().getTenantColumn() as string
                ] = options.projectId;
            }

            let query: Query<TBaseModel> = args['query'] as Query<TBaseModel>;

            if (query) {
                query = JSONFunctions.deserialize(
                    args['query'] as JSONObject
                ) as Query<TBaseModel>;
            }

            await this.modelService.deleteBy({
                query: query || {},
                limit: new PositiveNumber(args['limit'] as number),
                skip: new PositiveNumber(args['skip'] as number),
                props: {
                    isRoot: true,
                    tenantId: options.projectId,
                },
            });

            return {
                returnValues: {},
                executePort: successPort,
            };
        } catch (err: any) {
            options.log('Error running component');
            options.log(
                err.message ? err.message : JSON.stringify(err, null, 2)
            );
            return {
                returnValues: {},
                executePort: errorPort,
            };
        }
    }
}
