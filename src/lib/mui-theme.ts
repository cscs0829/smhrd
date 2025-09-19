'use client'

import { createTheme } from '@mui/material/styles'

// MUI 컴포넌트의 포털 컨테이너 설정
export const createMuiTheme = () => {
  // Next.js의 루트 엘리먼트 찾기
  const getRootElement = () => {
    if (typeof document !== 'undefined') {
      return document.getElementById('__next') || document.body
    }
    return null
  }

  return createTheme({
    components: {
      // Popover 컴포넌트 설정 (Select 드롭다운에서 사용)
      MuiPopover: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9999,
          },
          paper: {
            zIndex: 9999,
          },
        },
      },
      // Popper 컴포넌트 설정
      MuiPopper: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9999,
          },
        },
      },
      // Menu 컴포넌트 설정
      MuiMenu: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9999,
          },
          paper: {
            zIndex: 9999,
          },
        },
      },
      // Modal 컴포넌트 설정
      MuiModal: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9998, // 모달보다 낮게 설정
          },
        },
      },
      // Dialog 컴포넌트 설정
      MuiDialog: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9998, // 모달보다 낮게 설정
          },
        },
      },
      // Select 컴포넌트 설정
      MuiSelect: {
        styleOverrides: {
          root: {
            '&.MuiInputBase-root': {
              cursor: 'pointer',
              pointerEvents: 'auto',
            },
          },
          select: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            userSelect: 'none',
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
          icon: {
            cursor: 'pointer',
            pointerEvents: 'auto',
          },
        },
      },
      // MenuItem 컴포넌트 설정
      MuiMenuItem: {
        styleOverrides: {
          root: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.16)',
              },
            },
          },
        },
      },
      // TablePagination 컴포넌트 설정
      MuiTablePagination: {
        styleOverrides: {
          root: {
            position: 'relative',
            zIndex: 1,
          },
          select: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            '&.MuiInputBase-root': {
              cursor: 'pointer',
              pointerEvents: 'auto',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: 'transparent',
              },
            },
          },
          selectIcon: {
            cursor: 'pointer',
            pointerEvents: 'auto',
          },
          actions: {
            '& button': {
              cursor: 'pointer',
              pointerEvents: 'auto',
            },
          },
        },
      },
    },
    // z-index 값 설정
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 9998,
      snackbar: 1400,
      tooltip: 9999,
    },
  })
}