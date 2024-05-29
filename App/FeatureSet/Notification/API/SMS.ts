import SmsService from '../Services/SmsService';
import TwilioConfig from 'Common/Types/CallAndSMS/TwilioConfig';
import BadDataException from 'Common/Types/Exception/BadDataException';
import { JSONObject } from 'Common/Types/JSON';
import JSONFunctions from 'Common/Types/JSONFunctions';
import ObjectID from 'Common/Types/ObjectID';
import Phone from 'Common/Types/Phone';
import ClusterKeyAuthorization from 'CommonServer/Middleware/ClusterKeyAuthorization';
import ProjectCallSMSConfigService from 'CommonServer/Services/ProjectCallSMSConfigService';
import Express, {
    ExpressRequest,
    ExpressResponse,
    ExpressRouter,
} from 'CommonServer/Utils/Express';
import logger from 'CommonServer/Utils/Logger';
import Response from 'CommonServer/Utils/Response';
import ProjectCallSMSConfig from 'Model/Models/ProjectCallSMSConfig';

const router: ExpressRouter = Express.getRouter();

router.post(
    '/send',
    ClusterKeyAuthorization.isAuthorizedServiceMiddleware,
    async (req: ExpressRequest, res: ExpressResponse) => {
        const body: JSONObject = JSONFunctions.deserialize(req.body);

        await SmsService.sendSms(
            body['to'] as Phone,
            body['message'] as string,
            {
                projectId: body['projectId'] as ObjectID,
                isSensitive: (body['isSensitive'] as boolean) || false,
                userOnCallLogTimelineId:
                    (body['userOnCallLogTimelineId'] as ObjectID) || undefined,
                customTwilioConfig: body['customTwilioConfig'] as any,
            }
        );

        return Response.sendEmptySuccessResponse(req, res);
    }
);

router.post('/test', async (req: ExpressRequest, res: ExpressResponse) => {
    const body: JSONObject = req.body;

    const callSMSConfigId: ObjectID = new ObjectID(
        body['callSMSConfigId'] as string
    );

    const config: ProjectCallSMSConfig | null =
        await ProjectCallSMSConfigService.findOneById({
            id: callSMSConfigId,
            props: {
                isRoot: true,
            },
            select: {
                _id: true,
                twilioAccountSID: true,
                twilioAuthToken: true,
                twilioPhoneNumber: true,
                projectId: true,
            },
        });

    if (!config) {
        return Response.sendErrorResponse(
            req,
            res,
            new BadDataException(
                'call and sms config not found for id' +
                    callSMSConfigId.toString()
            )
        );
    }

    const toPhone: Phone = new Phone(body['toPhone'] as string);

    if (!toPhone) {
        return Response.sendErrorResponse(
            req,
            res,
            new BadDataException('toPhone is required')
        );
    }

    // if any of the twilio config is missing, we will not send make the call

    if (!config.twilioAccountSID) {
        return Response.sendErrorResponse(
            req,
            res,
            new BadDataException('twilioAccountSID is required')
        );
    }

    if (!config.twilioAuthToken) {
        return Response.sendErrorResponse(
            req,
            res,
            new BadDataException('twilioAuthToken is required')
        );
    }

    if (!config.twilioPhoneNumber) {
        return Response.sendErrorResponse(
            req,
            res,
            new BadDataException('twilioPhoneNumber is required')
        );
    }

    const twilioConfig: TwilioConfig | undefined =
        ProjectCallSMSConfigService.toTwilioConfig(config);

    try {
        if (!twilioConfig) {
            throw new BadDataException('twilioConfig is undefined');
        }

        await SmsService.sendSms(
            toPhone,
            'This is a test SMS from OneUptime.',
            {
                projectId: config.projectId,
                customTwilioConfig: twilioConfig,
            }
        );
    } catch (err) {
        logger.error(err);
        return Response.sendErrorResponse(
            req,
            res,
            new BadDataException(
                'Failed to send test SMS. Please check the twilio logs for more details.'
            )
        );
    }

    return Response.sendEmptySuccessResponse(req, res);
});

export default router;
