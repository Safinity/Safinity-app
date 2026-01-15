import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MupiCard from '../components/MupiCard';
import mupisDataJson from '../data/mupis.json';
import InputField from '../components/InputField';

const Page = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  color: var(--white);
  margin-bottom: 1rem;
`;

const SubtitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
`;

const Subtitle = styled.h2`
  color: var(--white);
  margin: 0;
`;

const AddButton = styled.button`
  background-color: var(--primary-normal);
  color: var(--white);
  border: none;
  border-radius: var(--radius-small);
  padding: 0.5rem 1rem;
  font-family: var(--text-botao-font);
  font-size: 1rem;
  cursor: pointer;
  transition: filter 0.2s;
  &:hover:enabled {
    filter: brightness(1.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ListWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  scroll-behavior: smooth;
`;

const ScrollableList = styled.div`
  display: inline-flex;
  gap: 1.5rem;
  padding-bottom: 1rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: var(--gray-navbar);
  padding: 1.5rem;
  border-radius: var(--radius-medium);
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  min-width: 500px;
  max-width: 90%;
  align-items: stretch;
`;

const PreviewCard = styled.div`
  width: 200px;
  height: 280px;
  border-radius: var(--radius-small);
  overflow: hidden;
  background-color: #444;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
  height: 100%;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
`;

const ModalButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background-color: ${(props) =>
        props.variant === 'primary'
            ? 'var(--primary-normal)'
            : props.variant === 'danger'
                ? '#cc3333'
                : '#666'};
  color: var(--white);
  border: none;
  border-radius: var(--radius-small);
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover:enabled {
    filter: brightness(1.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmModalContainer = styled(ModalContainer)`
  flex-direction: column;
  align-items: center;
  min-width: 300px;
  max-width: 90%;
`;

const ConfirmText = styled.p`
  color: var(--white);
  margin-bottom: 1rem;
  text-align: center;
`;

export default function Mupis() {
    const [mupisData, setMupisData] = useState(mupisDataJson);
    const [showModal, setShowModal] = useState(false);
    const [editingMupiId, setEditingMupiId] = useState<number | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newImage, setNewImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const storedMupis = localStorage.getItem('mupisData');
        if (storedMupis) setMupisData(JSON.parse(storedMupis));
    }, []);

    const openModalForNew = () => {
        setEditingMupiId(null);
        setNewTitle('');
        setNewImage(null);
        setPreviewUrl(undefined);
        setShowModal(true);
    };

    const openModalForEdit = (mupi: { id: number; title: string; image: string }) => {
        setEditingMupiId(mupi.id);
        setNewTitle(mupi.title);
        setPreviewUrl(mupi.image);
        setNewImage(null);
        setShowModal(true);
    };

    const handleCancel = () => {
        setShowModal(false);
        setEditingMupiId(null);
        setNewTitle('');
        setNewImage(null);
        setPreviewUrl(undefined);
    };

    useEffect(() => {
        if (newImage) {
            const reader = new FileReader();
            reader.onload = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(newImage);
        }
    }, [newImage]);

    const handleSaveMupi = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!newTitle || (!previewUrl && !editingMupiId)) return;

        let updatedMupis;
        if (editingMupiId !== null) {
            updatedMupis = mupisData.map((m) =>
                m.id === editingMupiId ? { ...m, title: newTitle, image: previewUrl || m.image } : m
            );
        } else {
            const newMupi = {
                id: mupisData.length + 1,
                title: newTitle,
                image: previewUrl || 'https://picsum.photos/400/600?random=99',
            };
            updatedMupis = [...mupisData, newMupi];
        }
        setShowModal(false);
        setMupisData(updatedMupis);
        localStorage.setItem('mupisData', JSON.stringify(updatedMupis));
    };

    const handleRemove = () => {
        if (editingMupiId !== null) {
            const updatedMupis = mupisData.filter((m) => m.id !== editingMupiId);
            setMupisData(updatedMupis);
            localStorage.setItem('mupisData', JSON.stringify(updatedMupis));
            setShowConfirmModal(false);
            setShowModal(false);
        }

    };

    const isEditing = editingMupiId !== null;
    const originalMupi = isEditing ? mupisData.find((m) => m.id === editingMupiId) : null;
    const isChanged =
        isEditing &&
        (newTitle !== (originalMupi?.title || '') || previewUrl !== (originalMupi?.image || ''));
    const canAdd = !isEditing && newTitle && previewUrl;

    return (
        <Page>
            <Title>Web Summit</Title>

            <SubtitleRow>
                <Subtitle>Mupis</Subtitle>
                <AddButton onClick={openModalForNew}>+ Add Mupi</AddButton>
            </SubtitleRow>

            <ListWrapper>
                <ScrollableList>
                    {mupisData.map((mupi) => (
                        <div key={mupi.id} onClick={() => openModalForEdit(mupi)}>
                            <MupiCard title={mupi.title} image={mupi.image} />
                        </div>
                    ))}
                </ScrollableList>
            </ListWrapper>

            {showModal && (
                <ModalOverlay onClick={handleCancel}>
                    <ModalContainer onClick={(e) => e.stopPropagation()}>
                        <PreviewCard>
                            {previewUrl && <img src={previewUrl} alt="Preview" />}
                        </PreviewCard>

                        <FormColumn>
                            <InputField
                                label="Title"
                                placeholder="Enter title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />

                            <label style={{ color: '#cfd3e0', marginTop: '8px', fontSize: '14px' }}>
                                Upload Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px',
                                    backgroundColor: '#2a303f',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginBottom: '5.4rem',
                                }}
                            />

                            <ButtonRow>
                                {isEditing && (
                                    <ModalButton variant="danger" onClick={() => setShowConfirmModal(true)}>
                                        Remove
                                    </ModalButton>
                                )}
                                <ModalButton variant="secondary" onClick={handleCancel}>
                                    Cancel
                                </ModalButton>
                                <ModalButton
                                    variant="primary"
                                    onClick={handleSaveMupi}
                                    disabled={isEditing ? !isChanged : !canAdd}
                                >
                                    {isEditing ? 'Save' : 'Add'}
                                </ModalButton>
                            </ButtonRow>
                        </FormColumn>
                    </ModalContainer>
                </ModalOverlay>
            )}

            {showConfirmModal && (
                <ModalOverlay onClick={() => setShowConfirmModal(false)}>
                    <ConfirmModalContainer onClick={(e) => e.stopPropagation()}>
                        <ConfirmText>Are you sure you want to remove this mupi?</ConfirmText>
                        <ButtonRow>
                            <ModalButton variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </ModalButton>
                            <ModalButton variant="danger" onClick={handleRemove}>
                                Remove
                            </ModalButton>
                        </ButtonRow>
                    </ConfirmModalContainer>
                </ModalOverlay>
            )}
        </Page>
    );
}
