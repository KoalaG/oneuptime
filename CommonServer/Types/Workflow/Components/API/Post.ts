import ComponentCode, { RunOptions, RunReturnType } from '../../ComponentCode';
import { ApiComponentUtils } from './Utils';
import HTTPErrorResponse from 'Common/Types/API/HTTPErrorResponse';
import HTTPResponse from 'Common/Types/API/HTTPResponse';
import URL from 'Common/Types/API/URL';
import Dictionary from 'Common/Types/Dictionary';
import APIException from 'Common/Types/Exception/ApiException';
import BadDataException from 'Common/Types/Exception/BadDataException';
import { JSONObject } from 'Common/Types/JSON';
import ComponentMetadata, { Port } from 'Common/Types/Workflow/Component';
import ComponentID from 'Common/Types/Workflow/ComponentID';
import APIComponents from 'Common/Types/Workflow/Components/API';
import API from 'Common/Utils/API';

export default class ApiPost extends ComponentCode {
    public constructor() {
        super();

        const Component: ComponentMetadata | undefined = APIComponents.find(
            (i: ComponentMetadata) => {
                return i.id === ComponentID.ApiPost;
            }
        );

        if (!Component) {
            throw new BadDataException('Component not found.');
        }

        this.setMetadata(Component);
    }

    public override async run(
        args: JSONObject,
        options: RunOptions
    ): Promise<RunReturnType> {
        const result: { args: JSONObject; successPort: Port; errorPort: Port } =
            ApiComponentUtils.sanitizeArgs(this.getMetadata(), args, options);

        let apiResult: HTTPResponse<JSONObject> | HTTPErrorResponse | null =
            null;

        try {
            apiResult = await API.post(
                args['url'] as URL,
                args['request-body'] as JSONObject,
                args['request-headers'] as Dictionary<string>
            );

            return Promise.resolve({
                returnValues: ApiComponentUtils.getReturnValues(apiResult),
                executePort: result.successPort,
            });
        } catch (err) {
            if (err instanceof HTTPErrorResponse) {
                return Promise.resolve({
                    returnValues: ApiComponentUtils.getReturnValues(err),
                    executePort: result.successPort,
                });
            }

            if (apiResult) {
                return Promise.resolve({
                    returnValues: ApiComponentUtils.getReturnValues(apiResult),
                    executePort: result.successPort,
                });
            }

            throw options.onError(
                new APIException('Something wrong happened.')
            );
        }
    }
}
