import Dexie from "dexie"

export interface AnalyticsUUID {
  uuid: string
}

export class AnalyticsDatabase extends Dexie {
  private analyticsUUID!: Dexie.Table<AnalyticsUUID, number>

  private oneTimeEvent!: Dexie.Table<{ name: string }, number>

  constructor() {
    super("tally/analytics")

    this.version(1).stores({
      // Let's use an incremental id. If we need to change the UUID
      // for any reason the migration will be trivial.
      // Note: we are using outbound primary index here, which means
      // that the id property won't be included in the stored object.
      // https://dexie.org/docs/inbound#example-of-outbound-primary-key
      analyticsUUID: "++,uuid",
    })

    this.version(2).stores({
      oneTimeEvent: "++,name",
    })
  }

  async getAnalyticsUUID(): Promise<string | undefined> {
    return (await this.analyticsUUID.reverse().first())?.uuid
  }

  async setAnalyticsUUID(uuid: string): Promise<void> {
    await this.analyticsUUID.add({ uuid })
  }

  async oneTimeEventExists(name: string): Promise<boolean> {
    const count = await this.oneTimeEvent.where("name").equals(name).count()
    return !!count
  }

  async setOneTimeEvent(name: string): Promise<void> {
    await this.oneTimeEvent.add({ name })
  }
}
export async function getOrCreateDB(): Promise<AnalyticsDatabase> {
  return new AnalyticsDatabase()
}
