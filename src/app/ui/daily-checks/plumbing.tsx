'use client'
import React, { useEffect, useState } from 'react'
import { Heading } from 'react-aria-components'
import { useMutation, useLazyQuery } from '@apollo/client'
import { UpdateVesselDailyCheck_LogBookEntrySection } from '@/app/lib/graphQL/mutation'
import {
    AlertDialog,
    DailyCheckField,
    DailyCheckGroupField,
    FooterWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import {
    GET_SECTION_MEMBER_COMMENTS,
    VesselDailyCheck_LogBookEntrySection,
} from '@/app/lib/graphQL/query'
import {
    UPDATE_SECTION_MEMBER_COMMENT,
    CREATE_SECTION_MEMBER_COMMENT,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import {
    getDailyCheckNotification,
    displayDescription,
    composeField,
    displayField,
    getFilteredFields,
    getSortOrder,
    getFieldLabel,
} from '@/app/ui/daily-checks/actions'
import { classes } from '@/app/components/GlobalClasses'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import 'react-quill/dist/quill.snow.css'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import VesselDailyCheck_LogBookEntrySectionModel from '@/app/offline/models/vesselDailyCheck_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'

export default function Plumbing({
    logBookConfig = false,
    vesselDailyCheck = false,
    comments,
    setComments,
    setTab,
    setVesselDailyCheck,
    locked,
    handleCreateTask,
    createMaintenanceCheckLoading,
    offline = false,
    edit_logBookEntry,
}: {
    logBookConfig: any
    vesselDailyCheck: any
    comments: any
    setComments: any
    setTab: any
    setVesselDailyCheck: any
    locked: boolean
    handleCreateTask: any
    createMaintenanceCheckLoading: any
    offline?: boolean
    edit_logBookEntry: any
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [saving, setSaving] = useState(false)
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [currentField, setCurrentField] = useState<any>('')
    const [sectionComment, setSectionComment] = useState<any>('')
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const commentModel = new SectionMemberCommentModel()
    const dailyCheckModel = new VesselDailyCheck_LogBookEntrySectionModel()
    const handlePlumbingChecks = async (check: Boolean, value: any) => {
        if (+vesselDailyCheck?.id > 0) {
            const variables = {
                id: vesselDailyCheck.id,
                [value]: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await dailyCheckModel.save(variables)
                setVesselDailyCheck([data])
                setSaving(true)
            } else {
                updateVesselDailyCheck_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const [updateVesselDailyCheck_LogBookEntrySection] = useMutation(
        UpdateVesselDailyCheck_LogBookEntrySection,
        {
            onCompleted: (response) => {
                console.log('Safety check completed')
            },
            onError: (error) => {
                console.error('Error completing safety check', error)
            },
        },
    )

    const [getSectionVesselDailyCheck_LogBookEntrySection] = useLazyQuery(
        VesselDailyCheck_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data =
                    response.readVesselDailyCheck_LogBookEntrySections.nodes
                setVesselDailyCheck(data)
                setSaving(true)
                if (vesselDailyCheck === data[0]) {
                    toast.dismiss()
                    toast.custom((t) =>
                        getDailyCheckNotification(
                            fields,
                            logBookConfig,
                            vesselDailyCheck,
                            'Plumbing',
                            handleSetTab,
                        ),
                    )
                }
            },
            onError: (error: any) => {
                console.error(
                    'VesselDailyCheck_LogBookEntrySection error',
                    error,
                )
            },
        },
    )

    const handleSetTab = (tab: any) => {
        toast.remove()
        setTab(tab)
    }

    useEffect(() => {
        if (saving) {
            toast.dismiss()
            toast.custom((t) =>
                getDailyCheckNotification(
                    fields,
                    logBookConfig,
                    vesselDailyCheck,
                    'Plumbing',
                    handleSetTab,
                ),
            )
        }
    }, [vesselDailyCheck])

    const getComment = (fieldName: string, commentType = 'FieldComment') => {
        const comment =
            comments?.length > 0
                ? comments.filter(
                      (comment: any) =>
                          comment.fieldName === fieldName &&
                          comment.commentType === commentType,
                  )
                : false
        return comment.length > 0 ? comment[0] : false
    }

    const showCommentPopup = (comment: string, field: any) => {
        setCurrentComment(comment ? comment : '')
        setCurrentField(field)
        setOpenCommentAlert(true)
    }

    const handleSaveComment = async () => {
        setOpenCommentAlert(false)
        const comment = (document.getElementById('comment') as HTMLInputElement)
            ?.value
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: currentField[0]?.fieldName,
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'FieldComment',
        }
        if (currentComment) {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            if (offline) {
                const offlineID = generateUniqueId()
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
    }

    const [updateSectionMemberComment] = useMutation(
        UPDATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response) => {
                console.log('Comment updated')
                loadSectionMemberComments()
            },
            onError: (error) => {
                console.error('Error updating comment', error)
            },
        },
    )

    const [createSectionMemberComment] = useMutation(
        CREATE_SECTION_MEMBER_COMMENT,
        {
            onCompleted: (response) => {
                console.log('Comment created')
                loadSectionMemberComments()
            },
            onError: (error) => {
                console.error('Error creating comment', error)
            },
        },
    )

    const [querySectionMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setComments(data)
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    )

    const loadSectionMemberComments = async () => {
        if (offline) {
            const data = await commentModel.getByLogBookEntrySectionID(
                vesselDailyCheck.id,
            )
            if (data) {
                setComments(data)
            }
        } else {
            await querySectionMemberComments({
                variables: {
                    filter: {
                        logBookEntrySectionID: { eq: vesselDailyCheck.id },
                    },
                },
            })
        }
    }

    const fields = [
        {
            name: 'BillgeCheck',
            label: 'Billges check for pollution control',
            value: 'bilge',
            sortOrder: getSortOrder('BillgeCheck', logBookConfig),
            checked: vesselDailyCheck?.bilge,
        },
        {
            name: 'Sewage',
            label: 'Monitor Sewage levels, Grey Water Systems',
            value: 'sewage',
            sortOrder: getSortOrder('Sewage', logBookConfig),
            checked: vesselDailyCheck?.sewage,
        },
        {
            name: 'FreshWater',
            label: 'Fresh Water Tanks, Water Pumps, Water Heater, Sinks, Showers, Taps',
            value: 'freshWater',
            sortOrder: getSortOrder('FreshWater', logBookConfig),
            checked: vesselDailyCheck?.freshWater,
        },
        {
            name: 'Sanitation',
            label: 'Inspect Marine Sanitation Devices (Toilet Systems), Thru-Hull Fittings, and Seacocks',
            value: 'sanitation',
            sortOrder: getSortOrder('Sanitation', logBookConfig),
            checked: vesselDailyCheck?.sanitation,
        },
        {
            name: 'PestControl',
            label: 'Pest Control/Pest Trap checks',
            value: 'pestControl',
            sortOrder: getSortOrder('PestControl', logBookConfig),
            checked: vesselDailyCheck?.pestControl,
        },
    ]

    const handleSave = async () => {
        if (offline) {
            const data = await dailyCheckModel.getByIds([vesselDailyCheck.id])
            setVesselDailyCheck(data)
            setSaving(true)
            if (vesselDailyCheck === data[0]) {
                toast.dismiss()
                toast.custom((t) =>
                    getDailyCheckNotification(
                        fields,
                        logBookConfig,
                        vesselDailyCheck,
                        'Plumbing',
                        handleSetTab,
                    ),
                )
            }
        } else {
            getSectionVesselDailyCheck_LogBookEntrySection({
                variables: {
                    id: [vesselDailyCheck.id],
                },
            })
        }
        toast.loading('Saving Plumbing...')
        const comment = sectionComment
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: 'Plumbing',
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: vesselDailyCheck.id,
            commentType: 'Section',
        }
        if (currentComment) {
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            if (offline) {
                const offlineID = generateUniqueId()
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
    }

    const handleGroupNoChange = (groupField: any, groupFieldParent: any) => {
        handlePlumbingChecks(
            false,
            fields.find((field: any) => field.name === groupFieldParent.name)
                ?.value,
        )
        groupField.map((field: any) => handlePlumbingChecks(false, field.value))
    }

    const handleGroupYesChange = (groupField: any, groupFieldParent: any) => {
        handlePlumbingChecks(
            true,
            fields.find((field: any) => field.name === groupFieldParent.name)
                ?.value,
        )
        groupField.map((field: any) => handlePlumbingChecks(true, field.value))
    }

    return (
        <>
            <div className="bg-white p-6 border border-slblue-100 rounded-lg dark:bg-sldarkblue-800">
                <div className="flex w-full justify-between items-center">
                    <h3 className="dark:text-white">Plumbing</h3>
                </div>
                <div className="grid grid-cols-1 my-3 md:grid-cols-2 lg:grid-cols-3 items-start">
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        {logBookConfig && vesselDailyCheck && (
                            <>
                                {getFilteredFields(
                                    fields,
                                    false,
                                    logBookConfig,
                                ).map((field: any, index: number) => (
                                    <DailyCheckField
                                        locked={locked || !edit_logBookEntry}
                                        key={index}
                                        displayField={displayField(
                                            field.name,
                                            logBookConfig,
                                        )}
                                        displayDescription={displayDescription(
                                            field.name,
                                            logBookConfig,
                                        )}
                                        setDescriptionPanelContent={
                                            setDescriptionPanelContent
                                        }
                                        setOpenDescriptionPanel={
                                            setOpenDescriptionPanel
                                        }
                                        setDescriptionPanelHeading={
                                            setDescriptionPanelHeading
                                        }
                                        displayLabel={getFieldLabel(
                                            field.name,
                                            logBookConfig,
                                        )}
                                        inputId={field.value}
                                        handleNoChange={() =>
                                            handlePlumbingChecks(
                                                false,
                                                field.value,
                                            )
                                        }
                                        defaultNoChecked={
                                            field.checked === 'Not_Ok'
                                        }
                                        handleYesChange={() =>
                                            handlePlumbingChecks(
                                                true,
                                                field.value,
                                            )
                                        }
                                        defaultYesChecked={
                                            field.checked === 'Ok'
                                        }
                                        commentAction={() =>
                                            showCommentPopup(
                                                getComment(field.name),
                                                composeField(
                                                    field.name,
                                                    logBookConfig,
                                                ),
                                            )
                                        }
                                        comment={
                                            getComment(field.name)?.comment
                                        }
                                    />
                                ))}
                                {getFilteredFields(fields, true, logBookConfig)
                                    ?.filter((groupField: any) =>
                                        displayField(
                                            groupField.name,
                                            logBookConfig,
                                        ),
                                    )
                                    ?.map((groupField: any) => (
                                        <div
                                            key={groupField.name}
                                            className="border rounded-lg p-4 col-span-3 my-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                <div className="text-lg my-3 mr-4">
                                                    {groupField.field?.title
                                                        ? groupField.field.title
                                                        : groupField.field
                                                              .label}
                                                    {displayDescription(
                                                        groupField.name,
                                                        logBookConfig,
                                                    ) && (
                                                        <SeaLogsButton
                                                            icon="alert"
                                                            className="w-6 h-6 sup -mt-2 ml-0.5"
                                                            action={() => {
                                                                setDescriptionPanelContent(
                                                                    displayDescription(
                                                                        groupField.name,
                                                                        logBookConfig,
                                                                    ),
                                                                )
                                                                setOpenDescriptionPanel(
                                                                    true,
                                                                )
                                                                setDescriptionPanelHeading(
                                                                    groupField.name,
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <DailyCheckGroupField
                                                        locked={
                                                            locked ||
                                                            !edit_logBookEntry
                                                        }
                                                        groupField={groupField?.items?.filter(
                                                            (field: any) =>
                                                                displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                ),
                                                        )}
                                                        handleYesChange={() =>
                                                            handleGroupYesChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        handleNoChange={() =>
                                                            handleGroupNoChange(
                                                                groupField?.items?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                ),
                                                                groupField,
                                                            )
                                                        }
                                                        defaultNoChecked={
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ).length > 0 &&
                                                            groupField?.items
                                                                ?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                )
                                                                ?.every(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        field.checked ===
                                                                        'Not_Ok',
                                                                )
                                                        }
                                                        defaultYesChecked={
                                                            groupField?.items?.filter(
                                                                (field: any) =>
                                                                    displayField(
                                                                        field.name,
                                                                        logBookConfig,
                                                                    ),
                                                            ).length > 0 &&
                                                            groupField?.items
                                                                ?.filter(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        displayField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                )
                                                                ?.every(
                                                                    (
                                                                        field: any,
                                                                    ) =>
                                                                        field.checked ===
                                                                        'Ok',
                                                                )
                                                        }
                                                        commentAction={() =>
                                                            showCommentPopup(
                                                                getComment(
                                                                    groupField.name,
                                                                ),
                                                                composeField(
                                                                    groupField.name,
                                                                    logBookConfig,
                                                                ),
                                                            )
                                                        }
                                                        comment={
                                                            getComment(
                                                                groupField.name,
                                                            )?.comment
                                                        }
                                                    />
                                                    {groupField?.items?.map(
                                                        (
                                                            field: any,
                                                            index: number,
                                                        ) => (
                                                            <DailyCheckField
                                                                locked={
                                                                    locked ||
                                                                    !edit_logBookEntry
                                                                }
                                                                className={`lg:!grid-cols-2`}
                                                                innerWrapperClassName={`lg:!col-span-1`}
                                                                key={index}
                                                                displayField={displayField(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayDescription={displayDescription(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                displayLabel={getFieldLabel(
                                                                    field.name,
                                                                    logBookConfig,
                                                                )}
                                                                inputId={
                                                                    field.value
                                                                }
                                                                handleNoChange={() =>
                                                                    handlePlumbingChecks(
                                                                        false,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultNoChecked={
                                                                    field.checked ===
                                                                    'Not_Ok'
                                                                }
                                                                handleYesChange={() =>
                                                                    handlePlumbingChecks(
                                                                        true,
                                                                        field.value,
                                                                    )
                                                                }
                                                                defaultYesChecked={
                                                                    field.checked ===
                                                                    'Ok'
                                                                }
                                                                commentAction={() =>
                                                                    showCommentPopup(
                                                                        getComment(
                                                                            field.name,
                                                                        ),
                                                                        composeField(
                                                                            field.name,
                                                                            logBookConfig,
                                                                        ),
                                                                    )
                                                                }
                                                                comment={
                                                                    getComment(
                                                                        field.name,
                                                                    )?.comment
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 my-3 md:grid-cols-3 lg:grid-cols-4 items-start dark:text-white">
                    <label className="hidden md:block">Comments</label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <textarea
                                id={`section_comment`}
                                rows={4}
                                readOnly={locked || !edit_logBookEntry}
                                className={classes.textarea}
                                placeholder="Comments ..."
                                /*onBlur={(e) =>
                                    getComment('Pluming', 'Section')?.id > 0
                                        ? updateSectionMemberComment({
                                              variables: {
                                                  input: {
                                                      id: getComment(
                                                          'Pluming',
                                                          'Section',
                                                      )?.id,
                                                      comment: e.target.value,
                                                  },
                                              },
                                          })
                                        : createSectionMemberComment({
                                              variables: {
                                                  input: {
                                                      fieldName: 'Pluming',
                                                      comment: e.target.value,
                                                      logBookEntryID:
                                                          +logentryID,
                                                      logBookEntrySectionID:
                                                          vesselDailyCheck.id,
                                                      commentType: 'Section',
                                                  },
                                              },
                                          })
                                }*/
                                defaultValue={
                                    getComment('Plumbing', 'Section')?.comment
                                }></textarea>
                        </div>
                    </div>
                </div>
            </div>
            {(!locked || edit_logBookEntry) && (
                <FooterWrapper>
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        action={() => router.back()}
                    />
                    <SeaLogsButton
                        text="Create Task"
                        type="secondary"
                        color="slblue"
                        icon="check"
                        action={handleCreateTask}
                        isDisabled={createMaintenanceCheckLoading}
                    />
                    <SeaLogsButton
                        text="Save"
                        type="primary"
                        color="sky"
                        icon="check"
                        action={handleSave}
                    />
                </FooterWrapper>
            )}
            <AlertDialog
                openDialog={openCommentAlert}
                setOpenDialog={setOpenCommentAlert}
                handleCreate={handleSaveComment}
                actionText="Save">
                <div
                    className={`flex flex-col ${locked || !edit_logBookEntry ? 'pointer-events-none' : ''}`}>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        Comment
                    </label>
                    <textarea
                        id="comment"
                        readOnly={locked || !edit_logBookEntry}
                        rows={4}
                        className="block p-2.5 w-full mt-4 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-white dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Comment"
                        onChange={(e) => setSectionComment(e.target.value)}
                        defaultValue={
                            currentComment ? currentComment.comment : ''
                        }></textarea>
                </div>
            </AlertDialog>
            <SlidingPanel type={'left'} isOpen={openDescriptionPanel} size={40}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    {openDescriptionPanel && (
                        <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-r-lg">
                            <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tr-lg bg-slblue-1000">
                                <Heading
                                    slot="title"
                                    className="text-lg font-semibold leading-6 my-2 text-white dark:text-slblue-200">
                                    Field -{' '}
                                    <span className="font-thin">
                                        {descriptionPanelHeading}
                                    </span>
                                </Heading>
                                <XMarkIcon
                                    className="w-6 h-6"
                                    onClick={() => {
                                        setOpenDescriptionPanel(false)
                                        setDescriptionPanelContent('')
                                        setDescriptionPanelHeading('')
                                    }}
                                />
                            </div>
                            <div className="text-xl p-4 flex-grow overflow-scroll">
                                <div
                                    className="text-xs leading-loose font-light"
                                    dangerouslySetInnerHTML={{
                                        __html: descriptionPanelContent,
                                    }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </SlidingPanel>
            <Toaster position="top-right" />
        </>
    )
}
