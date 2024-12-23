import gql from 'graphql-tag'

export const DownloadVesselDailyCheck_LogBookEntrySections = gql`
    query DownloadVesselDailyCheck_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readVesselDailyCheck_LogBookEntrySections(
            limit: $limit
            offset: $offset
        ) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                logBookEntryID
                checkTime
                bilgeLevels
                bilgePumps
                hull
                navEquipment
                oilAndWater
                engineRoomChecks
                forwardAndReverseBelts
                driveShafts
                steeringTiller
                cablesFRPullies
                throttleAndCable
                wiring
                beltsHosesClamps
                sandTraps
                batteries
                safetyEquipment
                checksWithManual
                cabin
                preStartupChecks
                engineChecks
                engineCheckPropellers
                forwardReverse
                electricalVisualFields
                postElectricalStrainers
                engineOilWater
                engineMountsAndStabilisers
                postStartupEngineChecks
                preEngineAndPropulsion
                postEngineAndPropulsion
                postElectrical
                otherEngineFields
                preFuelLevelStart
                preFuelLevelEnd
                houseBatteriesStatus
                checkOilPressure
                batteryIsCharging
                shorePowerIsDisconnected
                lockToLockSteering
                trimTabs
                oilWater
                electrical
                postStartupChecks
                navigationChecks
                depthSounder
                radar
                tracPlus
                chartPlotter
                sart
                aisOperational
                vhf
                uhf
                forwardAndReverse
                hull_HullStructure
                pontoonPressure
                bungsInPlace
                hull_DeckEquipment
                swimPlatformLadder
                biminiTopsCanvasCovers
                windscreenCheck
                nightLineDockLinesRelease
                floor
                engineMounts
                engineOil
                engineTellTale
                engineIsFit
                steeringFluid
                steeringRams
                steeringIsFit
                epirb
                lifeJackets
                fireExtinguisher
                unitTransomBolts
                cotterPins
                reverseBucketAndRam
                nozzleAndBearings
                tailHousing
                weatherSummary
                windDirection
                windStrength
                swell
                lifeRings
                flares
                fireHoses
                fireBuckets
                fireBlanket
                fireAxes
                firePump
                fireFlaps
                lifeRaft
                highWaterAlarm
                firstAid
                exterior
                interior
                charts
                documentCrewBriefings
                recordComments
                engineChecks
                steering
                cooling
                propulsion
                bilge
                engineRoom
                throttle
                jetUnit
                generator
                fuelLevel
                fuelTanks
                fuelFilters
                fuel
                hullStructure
                deckEquipment
                anchor
                hatches
                dayShapes
                hvac
                tv
                stabilizationSystems
                electronics
                gps
                radio
                navigationLights
                compass
                soundSignallingDevices
                navigationHazards
                wheelhouse
                bilgeCheck
                sewage
                freshWater
                sanitation
                pestControl
                mainEngine
                transmission
                steeringPropultion
                propulsionCheck
                stabilizers
                exhaust
                propulsionBatteriesStatus
                personOverboardRescueEquipment
                smokeDetectors
                shorePower
                electricalPanels
                seaStrainers
                sail
                mainEngineChecks
                electricalChecks
                engineRoomVisualInspection
                fuelSystems
                steeringChecks
                throttleAndCableChecks
                tenderOperationalChecks
                airShutoffs
                fireDampeners
                coolantLevels
                fuelShutoffs
                separators
                steeringRudders
                steeringHoses
                steeringTillers
                steeringHydraulicSystems
                operationalTestsOfHelms
                driveShaftsChecks
                gearBox
                propellers
                skeg
                crewResponsible {
                    nodes {
                        id
                        firstName
                        surname
                    }
                }
            }
        }
    }
`
