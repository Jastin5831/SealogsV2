import dayjs from 'dayjs'
import db from './db'
import SeaLogsMemberModel from './seaLogsMember'
import RiskFactorModel from './riskFactor'
class BarCrossingChecklistModel {
    seaLogsMemberModel = new SeaLogsMemberModel()
    riskFactorModel = new RiskFactorModel()
    async save(data) {
        try {
            // Convert number properties to strings
            const stringifiedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    typeof value === 'number' ? value.toString() : value,
                ]),
            )
            const id = stringifiedData.id
            let dataToSave = {
                ...stringifiedData,
                idbCRUD: 'Update',
                idbCRUDDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }
            let updatedData = await this.getById(id)
            if (!updatedData) {
                await db.BarCrossingChecklist.add(dataToSave)
            } else {
                await db.BarCrossingChecklist.update(id, dataToSave)
            }
            updatedData = await this.getById(id)
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getAll() {
        try {
            const data = await db.BarCrossingChecklist.toArray()
            return data
        } catch (error) {
            throw error
        }
    }
    async getById(id) {
        try {
            // Use the db.BarCrossingChecklist.get() method to retrieve data by idIs
            const data = await db.BarCrossingChecklist.get(`${id}`)
            const dataWithRelationships = await this.addRelationships(data)
            return dataWithRelationships
        } catch (error) {
            throw error
        }
    }
    async getByIds(ids) {
        try {
            const response = await db.BarCrossingChecklist.where('id')
                .anyOf(ids)
                .toArray()
            const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData
        } catch (error) {
            throw error
        }
    }
    async getByVesselID(id) {
        try {
            const response = await db.BarCrossingChecklist.where('vesselID')
                .equals(`${id}`)
                .toArray()
            return response // I did not add relationships here to avoid infinte loop
            /* const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData */
        } catch (error) {
            throw error
        }
    }
    async getByFieldID(fieldName, fieldID) {
        try {
            const response = await db.BarCrossingChecklist.where(`${fieldName}`)
                .equals(`${fieldID}`)
                .toArray()
            return response // I did not add relationships here to avoid infinte loop
            /* const updatedData = Promise.all(
                response.map(async (data) => {
                    const dataWithRelationships =
                        await this.addRelationships(data)
                    return dataWithRelationships
                }),
            )
            return updatedData */
        } catch (error) {
            throw error
        }
    }
    async bulkAdd(data) {
        try {
            // Use the db.BarCrossingChecklist.bulkAdd() method to save multiple data to the table
            await db.BarCrossingChecklist.bulkAdd(data)
            return data
        } catch (error) {
            throw error
        }
    }
    async addRelationships(data) {
        /*
                - Index
                    - vesselID
                - Relationship
                    - member (SeaLogsMemberInterface)
                    - riskFactors (RiskFactor, barCrossingChecklistID)
        */
        if (data) {
            // member
            const member = await this.seaLogsMemberModel.getById(data.memberID)
            // riskFactors
            const riskFactors = await this.riskFactorModel.getByFieldID(
                'barCrossingChecklistID',
                data.barCrossingChecklistID,
            )
            return {
                ...data,
                member: member,
                riskFactors: riskFactors,
            }
        } else {
            return data
        }
    }
    async setProperty(id) {
        try {
            if(id){
                let data = await db.BarCrossingChecklist.get(`${id}`)
                data.idbCRUD = 'Download'
                data.idbCRUDDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
                await db.BarCrossingChecklist.update(id, data)
                return data
            }
        } catch (error) {
            throw error
        }
    }
    async multiUpdate (data) {
        try {
            data.map( async item => {
                await db.BarCrossingChecklist.update(item.id, item)
            })
        } catch (error) {
            console.log('BarCrossingChecklist:',error)
        }
    }
}

export default BarCrossingChecklistModel