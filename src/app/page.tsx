'use client'

import {
  Badge,
  Button,
  Flex,
  Group,
  NavLink,
  Notification,
  Tree,
  TreeNodeData,
} from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { MRT_PaginationState, MRT_RowData } from 'mantine-react-table'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import useQueryCustom from './hooks/useQueryCustom'
import useMutationCustom from './hooks/useMutationCustom'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import MRT_Table from './components/MRT_Table'

// FIXME: 테스트용
const mapToTree = (data: Record<string, any>[]) => {
  // 1. 데이터를 value=code, label=codename으로 매핑
  const mappedData = data.map((item) => ({
    value: item.code,
    label: item.codename,
    refcode1: item.refcode1,
    children: [],
  }))

  // 2. refcode1 데이터가 있는 경우 children 속성 추가
  mappedData.forEach((item) => {
    if (item.refcode1) {
      // refcode1에서 코드를 추출
      const refcode1Key = item.refcode1.match(/\[([A-Z0-9]+)\]/)

      if (refcode1Key) {
        const childCode = refcode1Key[1] // 추출된 코드
        const child = mappedData.find((i) => i.value === childCode)
        if (child) {
          item.children.push(child)
        }
      }
    }
  })

  return mappedData
}

// 임시 트리 컴포넌트트
function TreeCustom({
  data,
  activeCode,
  handleActive,
}: {
  data: TreeNodeData[]
  activeCode: string
  handleActive: Dispatch<SetStateAction<string>>
}) {
  return (
    <Tree
      style={{
        width: '20%',
        maxHeight: '815px',
        overflow: 'scroll',
      }}
      data={data}
      levelOffset={23}
      renderNode={({ node, expanded, hasChildren, elementProps }) => {
        return (
          <Group gap={'xs'} {...elementProps}>
            <NavLink
              active={node.value == activeCode}
              label={
                <Flex align={'center'} gap={8}>
                  {hasChildren && (
                    <IconChevronDown
                      size={18}
                      style={{
                        transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'all 0.3s',
                      }}
                    />
                  )}
                  <span>{node.label}</span>
                  <Badge size="sm" circle>
                    {node.children?.length}
                  </Badge>
                </Flex>
              }
              onClick={() => handleActive(node.value)}
            />
          </Group>
        )
      }}
    />
  )
}

export default function Home() {
  const queryClient = useQueryClient()
  const [activeCode, setActiveCode] = useState<string>('')

  // 트리 데이터 호출
  const { isFetching: isFetchingTree, data: treeResult } = useQueryCustom(
    '/grpcode',
    {},
    { staleTime: 60_000 },
  )

  const useSelectCode = (params: {} = {}) => {
    return useQueryCustom(
      '/code',
      { grpcode: activeCode, ...params },
      {
        enabled: !!activeCode,
        staleTime: 10_000,
      },
    )
  }
  const useCreateCode = (queryKey) => {
    return useMutationCustom('/code', {
      method: 'POST',
      queryKey,
    })
  }
  const useUpdateCode = (queryKey) => {
    return useMutationCustom('/code', {
      method: 'PUT',
      queryKey,
    })
  }
  const useDeleteCode = (queryKey) => {
    return useMutationCustom('/code', {
      method: 'DELETE',
      queryKey,
    })
  }

  useEffect(() => {})

  const columns = [
    {
      accessorKey: 'code',
      header: 'code',
      editProps: {
        type: 'text',
      },
      primaryKey: true,
    },
    {
      accessorKey: 'grpcode',
      header: 'grpcode',
      editProps: {
        type: 'text',
      },
      defaultValue: activeCode,
      enableEditing: false,
    },
    {
      accessorKey: 'codename',
      header: 'codename',
      editProps: {
        type: 'text',
      },
    },
    {
      accessorKey: 'codename2',
      header: 'codename2',
      editProps: {
        type: 'text',
      },
    },
    {
      accessorKey: 'refcode1',
      header: 'refcode1',
      editProps: {
        type: 'select',
        // data: [
        //   { value: 'ESG060100', label: 'ESG060100' },
        //   { value: 'ESG060200', label: 'ESG060200' },
        // ],
        data: () => {
          return useQueryCustom(`/combo/code`, { grpcode: activeCode })
        },
      },
    },
    {
      accessorKey: 'refcode2',
      header: 'refcode2',
      editProps: {
        type: 'modal',
        columns: [
          {
            accessorKey: 'code',
            header: 'code',
            editProps: {
              type: 'text',
            },
            primaryKey: true,
          },
          {
            accessorKey: 'grpcode',
            header: 'grpcode',
            editProps: {
              type: 'text',
            },
            defaultValue: activeCode,
            enableEditing: false,
          },
          {
            accessorKey: 'codename',
            header: 'codename',
            editProps: {
              type: 'text',
            },
          },
          {
            accessorKey: 'codename2',
            header: 'codename2',
            editProps: {
              type: 'text',
            },
          },
          {
            accessorKey: 'refcode1',
            header: 'refcode1',
            editProps: {
              type: 'select',
              data: [
                { value: 'ESG060100', label: 'ESG060100' },
                { value: 'ESG060200', label: 'ESG060200' },
              ],
            },
          },
          {
            accessorKey: 'refcode2',
            header: 'refcode2',
          },
        ],
        data: useSelectCode,
        // targetColumn: 'code',
      },
    },
  ]

  return (
    <Flex align={'flex-start'} gap={16}>
      {isFetchingTree ? (
        <Notification loading title="잠시만 기다려주세요!" mt="md">
          서버에서 데이터를 불러오고 있습니다
        </Notification>
      ) : (
        <TreeCustom
          data={mapToTree(treeResult ? treeResult.data.data : [])}
          activeCode={activeCode}
          handleActive={setActiveCode}
        />
      )}
      <div style={{ width: '80%' }}>
        <MRT_Table
          columns={columns}
          enableEditing
          enableCreate
          enableEdit
          enableDelete
          useSelect={useSelectCode}
          useCreate={useCreateCode}
          useUpdate={useUpdateCode}
          useDelete={useDeleteCode}
          mantineTableContainerProps={{
            style: { maxHeight: '600px' }, //give the table a max height
          }}
        />
      </div>
    </Flex>
  )
}
