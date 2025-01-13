import User from "../../Models/DatabaseModels/User";
import Name from "../../Types/Name";
import ObjectID from "../../Types/ObjectID";
import DatabaseService from "./DatabaseService";
import Model from "Common/Models/DatabaseModels/IncidentInternalNote";
import UserService from "./UserService";
import { OnCreate } from "../Types/Database/Hooks";
import IncidentLogService from "./IncidentLogService";
import { IncidentLogEventType } from "../../Models/DatabaseModels/IncidentLog";
import { Blue500 } from "../../Types/BrandColors";

export class Service extends DatabaseService<Model> {
  public constructor() {
    super(Model);
  }


  public override async onCreateSuccess(_onCreate: OnCreate<Model>, createdItem: Model): Promise<Model> {

    const userId: ObjectID | null | undefined = createdItem.createdByUserId || createdItem.createdByUser?.id;
    let userName: Name | null = null;

    if (userId) {
      const user: User | null = await UserService.findOneById({
        id: userId,
        select: {
          name: true,
          email: true
        },
        props: {
          isRoot: true
        }
      });

      if (user && user.name) {
        userName = user.name;
      }
    }


    await IncidentLogService.createIncidentLog({
      incidentId: createdItem.id!,
      projectId: createdItem.projectId!,
      incidentLogEventType: IncidentLogEventType.PrivateNote,
      displayColor: Blue500,
      logInMarkdown: `**Private (Internal) Note Posted${userName ? " by "+userName : ""}**

${createdItem.note}
          `,
    });


    return createdItem;

  }
}

export default new Service();
